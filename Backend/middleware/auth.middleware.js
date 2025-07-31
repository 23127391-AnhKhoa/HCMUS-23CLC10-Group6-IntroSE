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
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token is required'
            });
        }
        
        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log('❌ Token verification failed:', err.message);
                return res.status(403).json({
                    status: 'error',
                    message: 'Invalid or expired token'
                });
            }
            
            // Add user info to request object
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('❌ Auth Middleware Error:', error);
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
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            
            if (req.user.role !== requiredRole) {
                return res.status(403).json({
                    status: 'error',
                    message: `${requiredRole} role required`
                });
            }
            
            next();
        } catch (error) {
            console.error('Auth Middleware Role Check Error:', error);
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
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return next();
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return next(); // Continue without user info
            }
            
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Auth Middleware Optional Error:', error);
        next(); // Continue without user info
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth
};
