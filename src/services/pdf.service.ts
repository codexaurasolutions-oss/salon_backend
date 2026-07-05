import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../server';

// Configure Cloudinary from environment variables
const cloudinaryEnabled =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a PDF Buffer to Cloudinary as a raw PDF resource
 */
export function uploadPdfToCloudinary(pdfBuffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!cloudinaryEnabled) {
      reject(new Error('Cloudinary credentials are not configured in environment variables.'));
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'salon-invoices',
        public_id: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        resource_type: 'raw',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary PDF upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );

    stream.end(pdfBuffer);
  });
}

/**
 * Generates a clean A4 PDF Invoice Buffer for a booking using pdfkit
 */
export function generateInvoicePdf(booking: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', (err) => {
        reject(err);
      });

      const pp = booking.platformPayments?.[0];
      const invoiceNumber = pp?.invoice_number || `INV-${booking.id.substring(0, 8).toUpperCase()}`;
      const invoiceDate = booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Draw Header
      doc.fillColor('#0f172a');
      doc.fontSize(24).font('Helvetica-Bold').text('NOAM SKIN', 50, 50);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b').text('PREMIUM BEAUTY & WELLNESS', 50, 75);

      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('TAX INVOICE', 380, 50, { align: 'right', width: 160 });
      doc.fontSize(9).font('Helvetica').fillColor('#475569').text(`Invoice No: ${invoiceNumber}`, 380, 75, { align: 'right', width: 160 });
      doc.text(`Date: ${invoiceDate}`, 380, 90, { align: 'right', width: 160 });

      doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // From / Bill To
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#94a3b8').text('FROM', 50, 135);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text(booking.salon.name, 50, 150);
      doc.fontSize(9).font('Helvetica').fillColor('#475569').text(booking.salon.email, 50, 165);
      doc.text(booking.salon.phone || '', 50, 180);
      doc.text(booking.salon.address || '', 50, 195, { width: 220 });

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#94a3b8').text('BILL TO', 300, 135);
      const customerName = booking.user?.profile?.full_name || booking.customer_name || 'Walk-in';
      const customerEmail = booking.user?.email || booking.customer_email || '';
      const customerPhone = booking.user?.profile?.phone || booking.customer_phone || '';
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text(customerName, 300, 150);
      doc.fontSize(9).font('Helvetica').fillColor('#475569').text(customerEmail, 300, 165);
      doc.text(customerPhone, 300, 180);

      doc.moveTo(50, 240).lineTo(545, 240).strokeColor('#e2e8f0').lineWidth(1).stroke();

      // Table Headers
      const tableTop = 260;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a');
      doc.text('Description', 50, tableTop);
      doc.text('Specialist', 250, tableTop);
      doc.text('Rate', 350, tableTop, { width: 60, align: 'right' });
      doc.text('Qty', 420, tableTop, { width: 30, align: 'right' });
      doc.text('Amount', 470, tableTop, { width: 75, align: 'right' });

      doc.moveTo(50, 275).lineTo(545, 275).strokeColor('#f1f5f9').lineWidth(1).stroke();

      // Table Row
      const rowTop = 285;
      doc.fontSize(9).font('Helvetica').fillColor('#334155');
      const serviceName = booking.service_name || booking.service?.name || 'Service';
      const specialist = booking.staff?.display_name || '-';
      const subtotal = Number(booking.service_price || booking.service?.price || booking.price || 0);
      const amount = Number(booking.price_paid || booking.service?.price || booking.price || 0);
      const discount = Number(booking.discount_amount || 0);
      const coinsUsed = Number(booking.coins_used || 0);
      const coinValue = Number(booking.coin_currency_value || 0.1) * coinsUsed;

      doc.text(serviceName, 50, rowTop, { width: 190 });
      doc.text(specialist, 250, rowTop);
      doc.text(`MYR ${subtotal.toFixed(2)}`, 350, rowTop, { width: 60, align: 'right' });
      doc.text('1', 420, rowTop, { width: 30, align: 'right' });
      doc.text(`MYR ${subtotal.toFixed(2)}`, 470, rowTop, { width: 75, align: 'right' });

      doc.moveTo(50, 315).lineTo(545, 315).strokeColor('#f1f5f9').lineWidth(1).stroke();

      // Summary block
      const summaryTop = 330;
      
      // Left: Payment Instructions
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('Payment Instructions', 50, summaryTop);
      doc.fontSize(8).font('Helvetica').fillColor('#475569');
      doc.text('Bank Name: Alliance Bank', 50, summaryTop + 15);
      doc.text('Account Name: Noam Skin Enterprise', 50, summaryTop + 30);
      doc.text('Account No: 140730013008888', 50, summaryTop + 45);

      // Right: Summary Calculations
      let calcTop = summaryTop;
      doc.fontSize(9).font('Helvetica').fillColor('#475569');
      doc.text('Subtotal', 350, calcTop, { width: 100, align: 'right' });
      doc.text(`MYR ${subtotal.toFixed(2)}`, 470, calcTop, { width: 75, align: 'right' });

      if (discount > 0) {
        calcTop += 15;
        doc.text('Discount', 350, calcTop, { width: 100, align: 'right' });
        doc.text(`- MYR ${discount.toFixed(2)}`, 470, calcTop, { width: 75, align: 'right' });
      }

      if (coinsUsed > 0) {
        calcTop += 15;
        doc.text(`Points Redeemed (${coinsUsed})`, 350, calcTop, { width: 100, align: 'right' });
        doc.text(`- MYR ${coinValue.toFixed(2)}`, 470, calcTop, { width: 75, align: 'right' });
      }

      calcTop += 20;
      doc.moveTo(350, calcTop - 5).lineTo(545, calcTop - 5).strokeColor('#e2e8f0').lineWidth(1).stroke();
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a');
      doc.text('Total Paid', 350, calcTop, { width: 100, align: 'right' });
      doc.text(`MYR ${amount.toFixed(2)}`, 470, calcTop, { width: 75, align: 'right' });

      calcTop += 15;
      doc.fontSize(8).font('Helvetica').fillColor('#64748b');
      doc.text(`Method: ${pp?.payment_method || 'Cash'}`, 350, calcTop, { width: 195, align: 'right' });

      // Footer note
      doc.moveTo(50, 480).lineTo(545, 480).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Thank you for choosing Noam Skin.', 50, 495, { align: 'center', width: 495 });
      doc.text('noamskin@gmail.com', 50, 510, { align: 'center', width: 495 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Helper to fetch booking details, generate PDF, upload to Cloudinary and update DB
 */
export async function generateAndUploadInvoice(bookingId: string): Promise<string> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      salon: true,
      user: { include: { profile: true } },
      staff: true,
      platformPayments: {
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  const pp = booking.platformPayments?.[0];
  const invoiceNumber = pp?.invoice_number || `INV-${booking.id.substring(0, 8).toUpperCase()}`;

  // Generate PDF buffer
  const pdfBuffer = await generateInvoicePdf(booking);

  // Upload to Cloudinary
  const cloudinaryUrl = await uploadPdfToCloudinary(pdfBuffer, `invoice-${invoiceNumber}-${booking.id}`);

  // Update the platform payment invoice url in database
  if (pp) {
    await prisma.platformPayment.update({
      where: { id: pp.id },
      data: { invoice_url: cloudinaryUrl }
    });
  }

  return cloudinaryUrl;
}
