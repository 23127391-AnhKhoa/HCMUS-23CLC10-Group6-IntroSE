import React, { useState, useEffect } from 'react';

const OTPForm = ({ email, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('OTP must be 6 digits long.');
      setLoading(false);
      return;
    }

    try {
      await onVerify(otp);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-blue-600">{email}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl animate-slide-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
            Verification Code
          </label>
          <div className="relative">
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              required
              className="form-input text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength="6"
              autoComplete="one-time-code"
            />
            {timeLeft > 0 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-sm text-gray-500">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="btn-primary relative"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </div>
          ) : (
            'Verify & Complete Registration'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={() => {
                // Handle resend OTP logic here
                setTimeLeft(300);
                setError('');
              }}
              disabled={timeLeft > 0}
            >
              {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend Code'}
            </button>
          </p>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Tips:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Check your spam/junk folder if you don't see the email</li>
              <li>• The code expires in 5 minutes</li>
              <li>• Make sure you entered the correct email address</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;