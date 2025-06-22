const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


function generatePhoneNumber() {
  const digitLength = faker.number.int({ min: 7, max: 15 });
  const randomNumber = faker.string.numeric(digitLength);

  if (Math.random() > 0.7) { 
    return `+${randomNumber}`;
  }
  return randomNumber;
}

async function main() {
  console.log('Resetting table sequences...');
  try {
    await prisma.$executeRawUnsafe('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE contacts_id_seq RESTART WITH 1;');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE spam_reports_id_seq RESTART WITH 1;');
    console.log('Sequences reset successfully.');
  } catch (error) {
    console.error('Error resetting sequences. This might happen if tables/sequences do not exist yet (e.g., first run). Continuing seeding...', error.message);
  }

  console.log('Seeding database...');
  

  const users = [];
  for (let i = 0; i < 100; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        phoneNumber: generatePhoneNumber(), 
        email: Math.random() > 0.3 ? faker.internet.email() : null,
        password: hashedPassword,
      },
    });
    users.push(user);
  }
  

  for (const user of users) {
    const contactCount = faker.number.int({ min: 5, max: 20 });
    for (let j = 0; j < contactCount; j++) {
      await prisma.contact.create({
        data: {
          name: faker.person.fullName(),
          phoneNumber: generatePhoneNumber(), 
          userId: user.id,
        },
      }).catch(e => {
        if (e.code !== 'P2002') { 
          console.warn(`Skipped creating a duplicate contact for user ${user.id} during seed: ${e.message}`);
        }
      });
    }
  }
  

  const phoneNumbersForSpam = [...new Set([ 
    ...users.map(u => u.phoneNumber), 
    ...Array.from({ length: 50 }, () => generatePhoneNumber()) 
  ])];
  
  for (let i = 0; i < 200; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomPhone = phoneNumbersForSpam[Math.floor(Math.random() * phoneNumbersForSpam.length)];
    
    try {
      await prisma.spamReport.create({
        data: {
          phoneNumber: randomPhone,
          reportedBy: randomUser.id,
        },
      });
    } catch (error) {
      if (error.code !== 'P2002') {
         console.warn(`Error creating spam report during seed (will be ignored if unique constraint): ${error.message}`);
      }
    }
  }
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });