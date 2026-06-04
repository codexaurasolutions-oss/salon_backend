import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding test accounts...');
    
    const hashPassword = async (pwd: string) => await bcrypt.hash(pwd, 10);

    // 1. Super Admin
    const superAdminId = uuidv4();
    await prisma.user.upsert({
        where: { email: 'superadmin@salon.com' },
        update: { password_hash: await hashPassword('admin123') },
        create: {
            id: superAdminId,
            email: 'superadmin@salon.com',
            password_hash: await hashPassword('admin123'),
            email_verified: true,
            profile: {
                create: {
                    id: uuidv4(),
                    full_name: 'Super Admin',
                    user_type: 'admin'
                }
            },
            admin: {
                create: {
                    id: uuidv4(),
                    is_active: true
                }
            }
        }
    });
    console.log('Created Super Admin.');

    // 2. Salon Owner
    const ownerId = uuidv4();
    const salonId = uuidv4();
    // Create the salon separately since salons_owned is not a direct relation on User
    await prisma.salon.upsert({
        where: { slug: 'skin-noam-clinic' },
        update: {},
        create: {
            id: salonId,
            name: 'Skin Noam Clinic',
            slug: 'skin-noam-clinic',
            address: '123 Beauty Ave',
            city: 'New York',
            approval_status: 'approved',
            is_active: true
        }
    });
    console.log('Created Salon.');

    await prisma.user.upsert({
        where: { email: 'skinnoam@gmail.com' },
        update: { password_hash: await hashPassword('noamskin@123') },
        create: {
            id: ownerId,
            email: 'skinnoam@gmail.com',
            password_hash: await hashPassword('noamskin@123'),
            email_verified: true,
            profile: {
                create: {
                    id: uuidv4(),
                    full_name: 'Skin Noam',
                    user_type: 'salon_owner'
                }
            },
            user_roles: {
                create: {
                    id: uuidv4(),
                    salon_id: salonId,
                    role: 'owner'
                }
            }
        }
    });
    console.log('Created Salon Owner.');

    // 3. Customer (User)
    const customerId = uuidv4();
    await prisma.user.upsert({
        where: { email: 'payal@gmail.com' },
        update: { password_hash: await hashPassword('payal@123') },
        create: {
            id: customerId,
            email: 'payal@gmail.com',
            password_hash: await hashPassword('payal@123'),
            email_verified: true,
            profile: {
                create: {
                    id: uuidv4(),
                    full_name: 'Payal Customer',
                    user_type: 'customer'
                }
            }
        }
    });
    console.log('Created Customer.');

    // 4. Staff
    const staffId = uuidv4();
    await prisma.user.upsert({
        where: { email: 'gori@gmail.com' },
        update: { password_hash: await hashPassword('gori@123') },
        create: {
            id: staffId,
            email: 'gori@gmail.com',
            password_hash: await hashPassword('gori@123'),
            email_verified: true,
            profile: {
                create: {
                    id: uuidv4(),
                    full_name: 'Gori Staff',
                    user_type: 'customer' // Staff are customers with a staff UserRole
                }
            },
            user_roles: {
                create: {
                    id: uuidv4(),
                    salon_id: salonId, // Attach to Skin Noam Clinic
                    role: 'staff'
                }
            }
        }
    });
    
    // Create Staff Profile
    await prisma.staffProfile.create({
        data: {
            id: uuidv4(),
            salon_id: salonId,
            user_id: staffId,
            display_name: 'Gori Staff',
            specializations: ['Hair Stylist'],
            is_active: true
        }
    });
    console.log('Created Staff.');

    console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
