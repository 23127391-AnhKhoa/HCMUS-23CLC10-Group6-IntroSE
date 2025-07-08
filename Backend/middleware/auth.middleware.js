/**
 * Authentication Middleware - JWT token verification
 * 
 * @file auth.middleware.js
 * @description Middleware for verifying JWT tokens and extracting user information
 * Protects routes that require authentication
 * 
 * @requires jsonwebtoken - For JWT token verification
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and extract user information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void} Calls next() if token is valid, otherwise sends error response
 */
const authenticateToken = (req, res, next) => {
    try {
        console.log('🔐 [Auth Middleware] Checking authentication');
        console.log('📄 All headers:', Object.keys(req.headers));
        console.log('📄 Authorization header raw:', req.headers.authorization);
        
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        console.log('📄 Auth header:', authHeader ? 'Present' : 'Missing');
        console.log('🎫 Token:', token ? 'Present' : 'Missing');
        console.log('🎫 Token preview:', token ? token.substring(0, 20) + '...' : 'N/A');
        
        if (!token) {
            console.log('❌ [Auth Middleware] No token provided');
            return res.status(401).json({
                status: 'error',
                message: 'Access token is required'
            });
        }
        
        // Verify token
        const jwtSecret = process.env.JWT_SECRET;
        console.log('🔑 JWT_SECRET loaded:', jwtSecret ? 'Yes' : 'No');
        console.log('🔑 JWT_SECRET preview:', jwtSecret ? jwtSecret.substring(0, 10) + '...' : 'N/A');
        
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                console.log('❌ [Auth Middleware] Invalid token:', err.message);
                return res.status(403).json({
                    status: 'error',
                    message: 'Invalid or expired token'
                });
            }
            
            console.log('✅ [Auth Middleware] Token verified for user:', user.uuid);
            console.log('👤 User info:', { uuid: user.uuid, email: user.email, role: user.role });
            
            // Add user info to request object
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('💥 [Auth Middleware] Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during authentication'
        });
    }
};

/**
 * Middleware to check if user has specific role
 * 
 * @param {string} requiredRole - Required role (e.g., 'admin', 'seller')
 * @returns {Function} Middleware function
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            console.log('🔒 [Auth Middleware] Checking role:', requiredRole);
            console.log('👤 User role:', req.user?.role);
            
            if (!req.user) {
                console.log('❌ [Auth Middleware] No user in request');
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            
            if (req.user.role !== requiredRole) {
                console.log('❌ [Auth Middleware] Insufficient permissions');
                return res.status(403).json({
                    status: 'error',
                    message: `${requiredRole} role required`
                });
            }
            
            console.log('✅ [Auth Middleware] Role check passed');
            next();
        } catch (error) {
            console.error('💥 [Auth Middleware] Role check error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error during role check'
            });
        }
    };
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is present, but doesn't require it
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void} Always calls next()
 */
const optionalAuth = (req, res, next) => {
    try {
        console.log('🔓 [Auth Middleware] Optional authentication check');
        
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            console.log('ℹ️ [Auth Middleware] No token provided (optional)');
            return next();
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log('⚠️ [Auth Middleware] Invalid token (optional):', err.message);
                return next(); // Continue without user info
            }
            
            console.log('✅ [Auth Middleware] Optional token verified for user:', user.uuid);
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('💥 [Auth Middleware] Optional auth error:', error);
        next(); // Continue without user info
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth
};
