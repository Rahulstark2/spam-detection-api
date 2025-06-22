const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const searchByName = async (req, res) => {
  try {
    const { name } = req.query;
    const userId = req.user.id;

    const [usersStartsWith, usersContains, contactsStartsWith, contactsContains] = await Promise.all([
     
      prisma.user.findMany({
        where: {
          name: {
            startsWith: name,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      }),
      
   
      prisma.user.findMany({
        where: {
          AND: [
            {
              name: {
                contains: name,
                mode: 'insensitive',
              },
            },
            {
              name: {
                not: {
                  startsWith: name,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      }),
      
      
      prisma.contact.findMany({
        where: {
          name: {
            startsWith: name,
            mode: 'insensitive',
          },
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      }),
      
    
      prisma.contact.findMany({
        where: {
          AND: [
            {
              name: {
                contains: name,
                mode: 'insensitive',
              },
            },
            {
              name: {
                not: {
                  startsWith: name,
                },
              },
            },
          ],
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      }),
    ]);

   
    const allResults = [
      ...usersStartsWith.map(u => ({ ...u, isRegistered: true })),
      ...contactsStartsWith.map(c => ({ ...c, isRegistered: false })),
      ...usersContains.map(u => ({ ...u, isRegistered: true })),
      ...contactsContains.map(c => ({ ...c, isRegistered: false })),
    ];


    const uniqueResults = allResults.reduce((acc, current) => {
      const existing = acc.find(item => item.phoneNumber === current.phoneNumber);
      if (!existing) {
        acc.push(current);
      } else if (current.isRegistered && !existing.isRegistered) {
        
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    }, []);


    const phoneNumbersFromUniqueResults = uniqueResults.map(r => r.phoneNumber);
    const spamCountsMap = new Map();

    if (phoneNumbersFromUniqueResults.length > 0) {
      const spamCountsData = await prisma.spamReport.groupBy({
        by: ['phoneNumber'],
        where: {
          phoneNumber: {
            in: phoneNumbersFromUniqueResults,
          },
        },
        _count: {
          phoneNumber: true, 
        },
      });

      
      spamCountsData.forEach(item => {
        spamCountsMap.set(item.phoneNumber, item._count.phoneNumber);
      });
    }

    const resultsWithSpam = uniqueResults.map(result => {
      const spamCount = spamCountsMap.get(result.phoneNumber) || 0; 
      const spamLikelihood = Math.min(spamCount * 10, 100);
      
      return {
        name: result.name,
        phoneNumber: result.phoneNumber,
        spamLikelihood,
        isRegistered: result.isRegistered,
      };
    });

    res.json({
      results: resultsWithSpam,
      count: resultsWithSpam.length,
    });
  } catch (error) {
    logger.error('Search by name error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

const searchByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    const userId = req.user.id;

    
    const registeredUser = await prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
      },
    });

    if (registeredUser) {
   
      const isInContacts = await prisma.contact.findFirst({
        where: {
          userId: registeredUser.id,
          phoneNumber: req.user.phoneNumber,
        },
      });

      const spamCount = await prisma.spamReport.count({
        where: { phoneNumber },
      });

      const result = {
        name: registeredUser.name,
        phoneNumber: registeredUser.phoneNumber,
        email: isInContacts ? registeredUser.email : null,
        spamLikelihood: Math.min(spamCount * 10, 100),
        isRegistered: true,
      };

      return res.json({
        results: [result],
        count: 1,
      });
    }

   
    const contacts = await prisma.contact.findMany({
      where: { phoneNumber },
      select: {
        name: true,
        phoneNumber: true,
      },
    });

    const spamCount = await prisma.spamReport.count({
      where: { phoneNumber },
    });

    const results = contacts.map(contact => ({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      email: null,
      spamLikelihood: Math.min(spamCount * 10, 100),
      isRegistered: false,
    }));

    res.json({
      results,
      count: results.length,
    });
  } catch (error) {
    logger.error('Search by phone error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { searchByName, searchByPhone };