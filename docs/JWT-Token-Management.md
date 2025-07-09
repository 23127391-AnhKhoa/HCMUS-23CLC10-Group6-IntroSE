# JWT Token Management Best Practices

## Hiện trạng và Cải tiến

### Vấn đề cũ
Trước đây, hầu hết các API đều tạo JWT token mới mỗi khi có thay đổi user data, bao gồm cả những thay đổi không quan trọng như balance.

### Giải pháp mới
Chỉ tạo JWT token mới khi thông tin **critical** trong token thay đổi.

## Phân loại API theo Token Generation

### 🔄 APIs CẦN tạo token mới (Role Changes)
```javascript
// 1. Become Seller - buyer → seller
POST /api/users/become-seller
Response: { user, token } // New token required

// 2. Switch to Buying - seller → buyer  
POST /api/users/switch-to-buying
Response: { user, token } // New token required

// 3. Reactivate Seller - buyer → seller
POST /api/users/reactivate-seller
Response: { user, token } // New token required
```

**Lý do cần token mới:**
- Role information được lưu trong JWT payload
- Role changes ảnh hưởng đến permissions và access control
- Frontend cần token mới để access role-specific features

### ✅ APIs KHÔNG CẦN tạo token mới (Data Updates)
```javascript
// 1. Deposit Money
POST /api/transactions/deposit
Response: { user, transaction } // No new token

// 2. Withdraw Money
POST /api/transactions/withdraw
Response: { user, transaction } // No new token

// 3. Update Profile (non-critical fields)
PUT /api/users/profile
Response: { user } // No new token (usually)
```

**Lý do không cần token mới:**
- Chỉ thay đổi balance hoặc profile data
- Không ảnh hưởng đến permissions
- Token hiện tại vẫn valid và có thể sử dụng

## Frontend Implementation

### AuthContext Functions

```javascript
// For APIs that only return updated user data
updateUser(updatedUserData)

// For APIs that return both user data and new token
updateUserWithToken(updatedUserData, newToken)
```

### Usage Examples

```javascript
// Deposit (no new token)
const handleDeposit = async (amount) => {
  const result = await api.post('/transactions/deposit', { amount });
  updateUser(result.user); // Only update user data
};

// Become Seller (new token required)
const handleBecomeSeller = async (sellerData) => {
  const result = await api.post('/users/become-seller', sellerData);
  updateUserWithToken(result.user, result.token); // Update both user and token
};
```

## Benefits của cách tiếp cận này

### 1. **Performance**
- Giảm CPU usage từ JWT signing/verification
- Giảm memory usage
- Faster API responses

### 2. **Security**
- Tokens có lifespan hợp lý
- Giảm risk của token exposure
- Better token management

### 3. **Frontend Simplicity**
- Không cần handle token updates liên tục
- Cleaner code
- Better user experience

### 4. **Network Efficiency**
- Giảm payload size
- Fewer token transmissions
- Reduced bandwidth usage

## JWT Payload Structure

```javascript
{
  uuid: "user-uuid",
  email: "user@example.com", 
  role: "buyer" | "seller",        // Critical - affects permissions
  is_seller: true | false,         // Critical - affects UI/routing
  exp: 1234567890,                 // Token expiration
  iat: 1234567890                  // Token issued at
}
```

## Migration Path

### Các API đã được refactored:
- ✅ `POST /api/transactions/deposit` - No token generation
- ✅ `POST /api/transactions/withdraw` - No token generation  
- ✅ `POST /api/users/become-seller` - Token generation (required)
- ✅ `POST /api/users/switch-to-buying` - Token generation (required)
- ✅ `POST /api/users/reactivate-seller` - Token generation (required)

### Cần review thêm:
- Profile update APIs
- Password change APIs
- Account setting APIs

## Testing

### Test Cases
1. **Deposit/Withdraw**: Verify balance updates without token change
2. **Role Changes**: Verify new token generation and role updates
3. **Token Expiration**: Verify proper handling of expired tokens
4. **Concurrent Requests**: Verify token consistency

### Frontend Testing
```javascript
// Test deposit doesn't change token
const oldToken = localStorage.getItem('token');
await handleDeposit(10);
const newToken = localStorage.getItem('token');
expect(oldToken).toBe(newToken);

// Test role change updates token
const oldToken = localStorage.getItem('token');
await handleBecomeSeller(sellerData);
const newToken = localStorage.getItem('token');
expect(oldToken).not.toBe(newToken);
```

## Conclusion

Việc chỉ tạo JWT token mới khi thật sự cần thiết giúp:
- Tối ưu performance
- Tăng security
- Giảm complexity
- Cải thiện user experience

Approach này follows industry best practices và JWT RFC standards.
