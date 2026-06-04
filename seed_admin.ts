import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'superadmin@salon.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        profile: {
          create: {
            full_name: 'Super Admin',
            user_type: 'admin'
          }
        }
      }
    });
    console.log('Super admin created:', user.email);
  } else {
    await prisma.user.update({
      where: { email },
      data: { password_hash: hashedPassword }
    });
    console.log('Super admin already exists. Password updated.');
  }

    const existingAdmin = await prisma.platformAdmin.findUnique({
      where: { user_id: user.id }
    });
    
    if (!existingAdmin) {
      await prisma.platformAdmin.create({
        data: {
          user_id: user.id,
          is_active: true
        }
      });
      console.log('Added PlatformAdmin record.');
    } else {
      console.log('Already has PlatformAdmin record.');
    }
}

seedAdmin().catch(console.error).finally(() => prisma.$disconnect());
