const jwt = require('jsonwebtoken');
const { PrismaClient, Prisma } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, phoneNumber: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError ||
               error instanceof Prisma.PrismaClientInitializationError ||
               error instanceof Prisma.PrismaClientRustPanicError ||
               error instanceof Prisma.PrismaClientUnknownRequestError) {
      return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
    
    return res.status(500).json({ error: 'Authentication failed. Please try again later.' });
  }
};

module.exports = { authenticateToken };