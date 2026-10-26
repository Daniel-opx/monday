/**
 * [YOUR AUTH EXERCISE] - Authentication Middleware
 *
 * When you are ready to lock down routes:
 * 1. Read the `Authorization` header (`Bearer <token>`) or session cookie.
 * 2. Verify the token with `jwt.verify(token, process.env.JWT_SECRET)`.
 * 3. Attach `req.user = { id: payload.sub, email: payload.email, name: payload.name }`.
 * 4. If invalid/missing, return `res.status(401).json({ error: 'Unauthorized' })`.
 */

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Auth not implemented yet! Complete server/middleware/authMiddleware.js',
    });
  }
  return res.status(501).json({
    error: 'Verify the Bearer token in server/middleware/authMiddleware.js!',
  });
}

function optionalAuth(req, _res, next) {
  req.user = null;
  next();
}

module.exports = { requireAuth, optionalAuth };
