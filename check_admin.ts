import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.user.findUnique({where:{email:'test@admin.com'}, include: {profile: true, admin: true}})
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error)
.finally(() => p.$disconnect());
