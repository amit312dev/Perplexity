import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};
