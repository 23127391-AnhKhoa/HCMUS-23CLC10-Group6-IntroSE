// services/auth.service.js
const User = require('../models/user.model');
const mailService = require('./mail.service');
const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Lưu trữ OTP tạm thời (Trong thực tế nên dùng Redis hoặc DB)
const otpStore = new Map();

const AuthService = {
  // Logic xử lý yêu cầu đăng ký
  handleRegister: async (userData) => {
    const { email, password, fullname, username } = userData;

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP 6 số
    // Gửi email
    await mailService.sendOTPEmail(email, otp);
    // 4. Lưu tạm thông tin user và OTP.
    // OTP hết hạn sau 5 phút
    // Quan trọng: Lưu lại `password` gốc để dùng cho `signUp` sau này.
    otpStore.set(email, {
      email: email,
      fullname: fullname,
      username: username,
      originalPassword: password, // cái này mà restart là mất nên ở dưới có lưu lại sau khi xác thực OTP
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000
    });
    return { message: 'OTP sent to your email. Please verify.' };
  },
  
  // Logic xử lý xác thực OTP
  handleVerifyOTP: async (email, otp) => {
    const storedData = otpStore.get(email);

    // 1. Kiểm tra OTP có tồn tại và còn hạn không
    if (!storedData || storedData.expires < Date.now()) {
      otpStore.delete(email);
      throw new Error('OTP expired or invalid.');
    }

    if (storedData.otp !== otp) {
      throw new Error('Incorrect OTP.');
    }

    // 2. Tạo user trên Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: storedData.email,
      password: storedData.originalPassword, // Cần lưu mật khẩu gốc để signUp
    });
    if (authError) throw authError;

    // 3. Tạo profile trong bảng public.users của chúng ta
    const profileData = {
        uuid: authUser.user.id,
        fullname: storedData.fullname,
        username: storedData.username,
        role: 'buyer',       // Mọi tài khoản mới đều là 'buyer'
        status: 'active'
    };
    const newProfile = await User.createProfile(profileData);

    // 4. Xóa OTP sau khi đã sử dụng
    otpStore.delete(email);

    return { message: 'Account created successfully. Please login.' };
  },
  
  // Logic xử lý đăng nhập
  // services/auth.service.js

    handleLogin: async (email, password) => {
        // 1. Supabase xử lý việc kiểm tra email/password
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        // Nếu có lỗi từ Supabase (sai pass, user không tồn tại...), ném lỗi ngay
        if (error) throw error;
        
        // Lấy ra đối tượng user từ Supabase Auth
        const authUser = data.user;

        // 2. Lấy thêm thông tin profile (bao gồm role) từ bảng public.users của chúng ta
        // Dùng ID từ authUser để tìm kiếm
        const userProfile = await User.findById(authUser.id); // Giả sử bạn đã đổi tên hàm thành findByUuid
        if (!userProfile) throw new Error("User profile not found in public schema.");

        // 3. Tạo payload cho JWT, kết hợp thông tin từ cả hai nguồn
        const payload = {
        // Lấy uuid từ userProfile (hoặc authUser.id, chúng giống nhau)
        uuid: userProfile.uuid, 
        
        // LẤY EMAIL TỪ ĐỐI TƯỢNG `authUser` của Supabase
        email: authUser.email,

        // Lấy role từ userProfile trong CSDL của bạn
        role: userProfile.role,
        
        // Tính toán is_seller dựa trên role
        is_seller: userProfile.role === 'seller',
        };
        
        // Tạo token với secret key của bạn
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        return { 
            token, 
            user: {
                ...payload,
                fullname: userProfile.fullname,
                username: userProfile.username,
                balance: userProfile.balance || 0,
                avatar_url: userProfile.avt_url, // Sửa tên field cho đúng với schema
                seller_headline: userProfile.seller_headline,
                seller_description: userProfile.seller_description,
                seller_since: userProfile.seller_since
            } // Trả về thông tin user đầy đủ hơn
        };
    },
    regenerateToken: (payload) => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    }
};

module.exports = AuthService;