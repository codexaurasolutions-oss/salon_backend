import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export class EmailService {
  static async sendOrderReceiptEmail(order: any, recipientEmail: string, recipientName?: string) {
    if (!recipientEmail) {
      console.log('[EmailService] Skipping order email: No recipient email provided.');
      return;
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name || 'Product'} x ${item.quantity || 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">MYR ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #1a1a1a; margin-bottom: 5px;">Thank you for your order!</h2>
        <p style="color: #666; font-size: 14px;">Hi ${recipientName || 'Customer'}, your order has been successfully recorded.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #334155;">Order ID: #${order.id?.substring(0, 8) || order.id}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Status: ${(order.status || 'placed').toUpperCase()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #1a1a1a; color: white;">
              <th style="padding: 8px; text-align: left; font-size: 12px;">Item</th>
              <th style="padding: 8px; text-align: right; font-size: 12px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 15px;">
          <p style="font-size: 16px; font-weight: bold; color: #1a1a1a;">Total Paid: MYR ${Number(order.total_amount || 0).toFixed(2)}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Noamskin Platform HQ • Kuala Lumpur, Malaysia</p>
      </div>
    `;

    try {
      console.log(`[EmailService] Attempting to send order email to ${recipientEmail}...`);
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Noamskin'}" <${process.env.SMTP_USER || 'hello@noamskin.com'}>`,
        to: recipientEmail,
        subject: `Order Confirmation #${order.id?.substring(0, 8)} - Noamskin`,
        html: htmlContent
      });
      console.log(`[EmailService] Order email sent successfully to ${recipientEmail}`);
    } catch (error: any) {
      console.error(`[EmailService] Failed to send order email to ${recipientEmail}:`, error?.message || error);
    }
  }
}
