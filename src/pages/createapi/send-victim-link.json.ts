import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, method, recipient, link } = data;
    
    if (!sessionId || !method || !recipient || !link) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (method === 'email') {
      // Email sending logic
      // For now, we'll use a simple placeholder
      // In production, integrate with SendGrid, AWS SES, or similar
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) {
        return new Response(JSON.stringify({
          error: 'Invalid email address'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // TODO: Integrate with actual email service
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // const msg = {
      //   to: recipient,
      //   from: 'noreply@yourapp.com',
      //   subject: 'Your Remote Assistance Session Link',
      //   html: `
      //     <p>An advocate is ready to help you complete your form.</p>
      //     <p>Click the link below to join the session:</p>
      //     <p><a href="${link}">${link}</a></p>
      //     <p>This link is unique to your session and should not be shared.</p>
      //   `
      // };
      // await sgMail.send(msg);
      
      // For development, just log
      console.log(`[EMAIL] Would send to ${recipient}: ${link}`);
      
      return new Response(JSON.stringify({
        success: true,
        method: 'email',
        recipient,
        message: 'Email sent successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (method === 'sms') {
      // SMS sending logic via Twilio
      
      // Validate phone number (basic validation)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(recipient) || recipient.length < 10) {
        return new Response(JSON.stringify({
          error: 'Invalid phone number'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Format phone number for Twilio (ensure it starts with country code)
      let formattedPhone = recipient.replace(/\D/g, '');
      if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
        formattedPhone = '1' + formattedPhone; // Add US country code
      }
      formattedPhone = '+' + formattedPhone;
      
      // TODO: Integrate with Twilio
      // Example with Twilio:
      // const twilio = require('twilio');
      // const client = twilio(
      //   process.env.TWILIO_ACCOUNT_SID,
      //   process.env.TWILIO_AUTH_TOKEN
      // );
      // await client.messages.create({
      //   body: `Your advocate is ready to help. Join your session: ${link}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: formattedPhone
      // });
      
      // For development, just log
      console.log(`[SMS] Would send to ${formattedPhone}: ${link}`);
      
      return new Response(JSON.stringify({
        success: true,
        method: 'sms',
        recipient: formattedPhone,
        message: 'SMS sent successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      return new Response(JSON.stringify({
        error: 'Invalid method. Use "email" or "sms"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Send victim link error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send link',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};