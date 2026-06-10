const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    const booking = await prisma.booking.findFirst();
    if (!booking) return console.log('No booking');
    
    const payload = {
        booking_id: booking.id, 
        user_id: booking.user_id, 
        salon_id: booking.salon_id,
        service_name_manual: undefined,
        record_date: undefined,
        treatment_details: 'test',
        products_used: 'test',
        skin_reaction: 'test',
        improvement_notes: 'test',
        recommended_next_treatment: 'test',
        post_treatment_instructions: 'test',
        follow_up_reminder_date: undefined,
        marketing_notes: undefined,
        before_photo_url: '',
        before_photo_public_id: undefined,
        after_photo_url: '',
        after_photo_public_id: undefined
    };

    console.log('Testing create...');
    await prisma.treatmentRecord.create({ data: payload });
    console.log('Success!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
