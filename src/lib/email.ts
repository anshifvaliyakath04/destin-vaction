import nodemailer from 'nodemailer';
import { supabaseServer } from './supabase-server';

let transporter: nodemailer.Transporter | null = null;

export function resetTransporter() {
  transporter = null;
}

export async function getTransporter() {
  const { data: settings } = await supabaseServer.from('settings').select('*').limit(1).maybeSingle() as any;
  
  const emailUser = (settings?.email_user || process.env.EMAIL_USER || '').trim();
  const rawEmailPass = (settings?.email_pass || process.env.EMAIL_PASS || '').trim();
  const emailPass = rawEmailPass.replace(/\s+/g, '');
  const emailHost = (settings?.email_host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const emailPort = settings?.email_port || parseInt(process.env.SMTP_PORT || '587');
  const emailSecure = settings?.email_secure ?? (process.env.SMTP_SECURE === 'true');

  if (!emailUser || !emailPass) {
    console.warn('No SMTP email credentials configured in settings or environment.');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: { user: emailUser, pass: emailPass },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const t = await getTransporter();
  if (!t) return;

  const { data: settings } = await supabaseServer.from('settings').select('*').limit(1).maybeSingle() as any;
  const fromName = settings?.email_from_name || 'Destin Vacations';
  const fromEmail = settings?.email_user || process.env.EMAIL_USER || 'Sales@destin.in';

  await t.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });
}

export async function sendAdminNotificationEmail(trip: any) {
  const t = await getTransporter();
  if (!t) return;

  const { data: settings } = await supabaseServer.from('settings').select('*').limit(1).maybeSingle() as any;
  const adminEmail = settings?.admin_notification_email || process.env.ADMIN_EMAIL || settings?.email_user || process.env.EMAIL_USER || 'Sales@destin.in';
  
  const fromName = settings?.email_from_name || 'Destin Vacations';
  const fromEmail = settings?.email_user || process.env.EMAIL_USER || 'Sales@destin.in';
  const replyTo = settings?.email_user || process.env.EMAIL_USER || 'Sales@destin.in';

  const customerName = trip.user_name || trip.customer_name || 'Customer';
  const customerEmail = trip.user_email || trip.customer_email || 'N/A';
  const customerPhone = trip.user_phone || trip.customer_phone || 'N/A';
  const destNames = Array.isArray(trip.destinations) ? trip.destinations.join(', ') : (trip.destinations || 'N/A');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 1rem;">
        <h2>New Tour Booking Alert!</h2>
        <p>A new tour package request has been submitted.</p>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; font-weight: bold; width: 40%;">Customer Name:</td><td>${customerName}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${customerEmail}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${customerPhone}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Destination(s):</td><td>${destNames}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Start Date:</td><td>${trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Duration:</td><td>${trip.duration}</td></tr>
        </table>
        <p style="margin-top: 1rem;"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="background: #3498db; color: white; padding: 0.5rem 1rem; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a></p>
    </div>
  `;

  await t.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    replyTo,
    to: adminEmail,
    subject: `🚨 New Booking Alert: ${customerName} - ${destNames}`,
    html: htmlContent
  });
}

export async function sendConfirmationEmail(trip: any, reason: string = '') {
  const t = await getTransporter();
  if (!t) return;

  const { data: settings } = await supabaseServer.from('settings').select('*').limit(1).maybeSingle() as any;
  const fromName = settings?.email_from_name || 'Destin Vacations';
  const fromEmail = settings?.email_user || process.env.EMAIL_USER || 'Sales@destin.in';
  const replyTo = settings?.email_user || process.env.EMAIL_USER || 'Sales@destin.in';

  const recipientEmail = trip.user_email || trip.customer_email;
  const recipientName = trip.user_name || trip.customer_name || 'Valued Customer';
  if (!recipientEmail) {
    console.warn('Cannot send status email: No recipient email address found on trip', trip.id);
    return;
  }
  const status = trip.status;
  const destinationsStr = Array.isArray(trip.destinations) ? trip.destinations.join(', ') : (trip.destinations || 'N/A');

  let subject = '';
  let htmlContent = '';

  if (status === 'Approved') {
    subject = 'Your Trip Booking Has Been Confirmed – Destin Vacations';
    
    let tripId = trip.id || 'N/A';
    let tripDuration = trip.duration || 'N/A';
    let startDateStr = 'N/A';
    let endDateStr = 'N/A';
    let travelersStr = 'N/A';

    if (trip.start_date) {
      try {
        const startDate = new Date(trip.start_date);
        if (!isNaN(startDate.getTime())) {
          const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
          startDateStr = startDate.toLocaleDateString('en-US', options);
          
          let days = 1;
          const daysMatch = trip.duration && trip.duration.match(/(\d+)\s*Day/i);
          if (daysMatch) {
            days = parseInt(daysMatch[1], 10);
          }
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (days - 1));
          endDateStr = endDate.toLocaleDateString('en-US', options);
        } else {
          startDateStr = trip.start_date;
        }
      } catch (e) {
        startDateStr = trip.start_date;
      }
    }

    const adultsCount = trip.adults || 0;
    const childrenCount = trip.children || 0;
    travelersStr = `${adultsCount} Adult${adultsCount !== 1 ? 's' : ''}`;
    if (childrenCount > 0) {
      travelersStr += `, ${childrenCount} Child${childrenCount !== 1 ? 'ren' : ''}`;
    }

    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px; line-height: 1.6; color: #333;">
          <p style="margin-top: 0;">Dear <b>${recipientName}</b>,</p>
          <p>Greetings from Destin Vacations! 🌍</p>
          <p>We are delighted to inform you that your trip booking has been successfully confirmed. Thank you for choosing us to plan your journey.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2ecc71;">
              <h3 style="margin-top: 0; color: #2ecc71; border-bottom: 1px solid #ddd; padding-bottom: 8px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.5px;">Trip Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                  <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #555; width: 40%;">Booking ID:</td>
                      <td style="padding: 6px 0; color: #111;">#${tripId}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #555;">Destination(s):</td>
                      <td style="padding: 6px 0; color: #111;">${destinationsStr}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #555;">Number of Travelers:</td>
                      <td style="padding: 6px 0; color: #111;">${travelersStr}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #555;">Journey Start Date:</td>
                      <td style="padding: 6px 0; color: #111;">${startDateStr}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #555;">Journey End Date:</td>
                      <td style="padding: 6px 0; color: #111;">${endDateStr}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: bold; color: #555;">Trip Duration:</td>
                      <td style="padding: 6px 0; color: #111;">${tripDuration}</td>
                  </tr>
              </table>
          </div>
          
          <p>Thank you once again for booking with Destin Vacations.</p>
          <p>We look forward to making your trip memorable and comfortable.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.95rem; color: #555;">
              <p style="margin: 0; font-weight: bold; color: #333;">Warm regards,</p>
              <p style="margin: 4px 0 0 0; font-weight: bold; color: #2ecc71;">Team Destin Vacations</p>
              <p style="margin: 6px 0 0 0;">📧 <a href="mailto:Sales@destin.in" style="color: #3498db; text-decoration: none;">Sales@destin.in</a></p>
              <p style="margin: 4px 0 0 0;">📞 +91 9526886600</p>
          </div>
      </div>
    `;
  } else if (status === 'Rejected') {
    subject = 'Trip Booking Update – Destin Vacations';
    const reasonHtml = reason ? `<div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;"><p style="margin: 0; font-size: 0.95rem; color: #333; font-style: italic;"><b>Reason for rejection:</b><br>"${reason}"</p></div>` : '';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px; line-height: 1.6; color: #333;">
          <p style="margin-top: 0;">Dear <b>${recipientName}</b>,</p>
          <p>Greetings from Destin Vacations.</p>
          <p>Thank you for choosing us for your travel planning. After reviewing your booking request, we regret to inform you that we are unable to process your booking request for <b>${destinationsStr}</b> at this time.</p>
          ${reasonHtml}
          <p>We sincerely apologize for the inconvenience caused and appreciate your understanding. We hope to serve you on your future trips with Destin Vacations.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.95rem; color: #555;">
              <p style="margin: 0; font-weight: bold; color: #333;">Warm regards,</p>
              <p style="margin: 4px 0 0 0; font-weight: bold; color: #e74c3c;">Team Destin Vacations</p>
              <p style="margin: 6px 0 0 0;">📧 <a href="mailto:Sales@destin.in" style="color: #3498db; text-decoration: none;">Sales@destin.in</a></p>
              <p style="margin: 4px 0 0 0;">📞 +91 9526886600</p>
          </div>
      </div>
    `;
  } else {
    return;
  }

  try {
    const info = await t.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      replyTo,
      to: recipientEmail,
      subject,
      html: htmlContent
    });
    console.log(` Confirmation email sent successfully to ${recipientEmail}. MessageId: ${info.messageId}`);
  } catch (sendErr) {
    console.error(`Failed to send confirmation email to ${recipientEmail}:`, sendErr);
    throw sendErr;
  }
}
