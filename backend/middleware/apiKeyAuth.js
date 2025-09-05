const ApiKey = require('../models/ApiKey');

// Enhanced API key authentication middleware
const apiKeyAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
      
      if (!apiKey) {
        return res.status(401).json({ 
          error: 'API key required',
          message: 'Please provide a valid API key in the x-api-key header'
        });
      }

      // Find the API key in database
      const keyRecord = await ApiKey.findByKey(apiKey);
      
      if (!keyRecord) {
        return res.status(401).json({ 
          error: 'Invalid API key',
          message: 'The provided API key is invalid or expired'
        });
      }

      // Check if key is valid (active and not expired)
      if (!keyRecord.isValid) {
        return res.status(401).json({ 
          error: 'API key inactive or expired',
          message: 'The API key is either inactive or has expired'
        });
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          keyRecord.hasPermission(permission)
        );
        
        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            message: `This API key does not have the required permissions: ${requiredPermissions.join(', ')}`
          });
        }
      }

      // Log the API usage (async, don't block the request)
      setImmediate(() => {
        keyRecord.logUsage(
          req.originalUrl || req.url,
          req.method,
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent') || 'Unknown'
        ).catch(err => {
          console.error('Failed to log API usage:', err);
        });
      });

      // Attach API key info to request
      req.apiKey = keyRecord;
      req.apiKeyPermissions = keyRecord.permissions;

      next();
    } catch (error) {
      console.error('API Key Auth Error:', error);
      res.status(500).json({ 
        error: 'Authentication error',
        message: 'An error occurred while validating the API key'
      });
    }
  };
};

// Middleware for checking specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey || !req.apiKey.hasPermission(permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This operation requires the '${permission}' permission`
      });
    }
    next();
  };
};

// Rate limiting middleware based on API key
const apiKeyRateLimit = () => {
  const requests = new Map(); // In production, use Redis
  
  return (req, res, next) => {
    if (!req.apiKey) {
      return next();
    }

    const keyId = req.apiKey._id.toString();
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = req.apiKey.rateLimit;

    if (!requests.has(keyId)) {
      requests.set(keyId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const keyData = requests.get(keyId);
    
    if (now > keyData.resetTime) {
      // Reset the counter
      keyData.count = 1;
      keyData.resetTime = now + windowMs;
      requests.set(keyId, keyData);
      return next();
    }

    if (keyData.count >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Rate limit of ${limit} requests per hour exceeded`,
        resetTime: new Date(keyData.resetTime).toISOString()
      });
    }

    keyData.count++;
    requests.set(keyId, keyData);
    next();
  };
};

module.exports = {
  apiKeyAuth,
  requirePermission,
  apiKeyRateLimit
};