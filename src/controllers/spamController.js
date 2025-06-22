const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const reportSpam = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.id;

    const existingReport = await prisma.spamReport.findUnique({
      where: {
        phoneNumber_reportedBy: {
          phoneNumber,
          reportedBy: userId,
        },
      },
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this number as spam' });
    }

    const spamReport = await prisma.spamReport.create({
      data: {
        phoneNumber,
        reportedBy: userId,
      },
    });

    const spamCount = await prisma.spamReport.count({
      where: { phoneNumber },
    });

    res.status(201).json({
      message: 'Phone number reported as spam successfully',
      spamReport: {
        id: spamReport.id,
        phoneNumber: spamReport.phoneNumber,
        reportedAt: spamReport.createdAt,
      },
      totalSpamReports: spamCount,
    });
  } catch (error) {
    logger.error('Report spam error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const getSpamStatus = async (req, res) => {
  try {
    let { phoneNumber } = req.query;

    if (phoneNumber && phoneNumber.startsWith(' ')) {
      phoneNumber = '+' + phoneNumber.substring(1);
    }

    console.log('Checking spam status for phone number:', phoneNumber); 

    const spamCount = await prisma.spamReport.count({
      where: { phoneNumber },
    });

    const spamLikelihood = Math.min(spamCount * 10, 100);

    res.json({
      phoneNumber,
      spamReports: spamCount,
      spamLikelihood,
      isSpam: spamLikelihood > 50,
    });
  } catch (error) {
    logger.error('Get spam status error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { reportSpam, getSpamStatus };