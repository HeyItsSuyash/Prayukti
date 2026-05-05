import mongoose from 'mongoose';
import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';
import logger from '../src/core/config/logger';

dotenv.config();

const prisma = new PrismaClient();

async function migrate() {
  try {
    logger.info('🚀 Starting Data Migration: MongoDB -> PostgreSQL');

    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info('✅ Connected to MongoDB');

    // 2. Migrate Users
    const mongoUsers = await mongoose.connection.db.collection('users').find().toArray();
    logger.info(`Found ${mongoUsers.length} users in MongoDB`);

    for (const mu of mongoUsers) {
      const roleMapping: Record<string, Role> = {
        'student': Role.STUDENT,
        'teacher': Role.TEACHER,
        'admin': Role.ADMIN,
      };

      await prisma.user.upsert({
        where: { email: mu.email },
        update: {},
        create: {
          email: mu.email,
          passwordHash: mu.password, // Transferring hashed passwords as is
          fullName: mu.fullName,
          role: roleMapping[mu.role] || Role.STUDENT,
          rollNo: mu.rollNo,
          enrollmentNo: mu.enrollmentNo,
          branch: mu.branch,
          year: mu.year,
          semester: mu.semester,
          isVerified: mu.isVerified || false,
          createdAt: mu.createdAt || new Date(),
        },
      });
    }
    logger.info('✅ Users migrated');

    // 3. Migrate Subjects (Example)
    // Note: Legacy subjects were often hardcoded in a map. 
    // We should create them from that map or any 'subjects' collection.
    const subjects = ['BCS-301', 'BCS-302', 'BCS-303']; // Example
    for (const code of subjects) {
      await prisma.subject.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: `Subject ${code}`,
        },
      });
    }
    logger.info('✅ Subjects initialized');

    logger.info('🎉 Migration completed successfully');
  } catch (err) {
    logger.error('❌ Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

migrate();
