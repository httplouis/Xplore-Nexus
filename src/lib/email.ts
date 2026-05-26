// @ts-ignore - nodemailer type declaration
import nodemailer from "nodemailer";

// Email templates with explicit parameter types
type TemplateFunction = (
  ...args: any[]
) => {
  subject: string;
  html: string;
};

const TEMPLATES: Record<string, TemplateFunction> = {
  REGISTRATION_CONFIRMATION: (
    name: string,
    eventName: string,
    ticketCode: string
  ) => ({
    subject: `Registration Confirmed: ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Registration Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>You have successfully registered for <strong>${eventName}</strong></p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Your Ticket Code:</strong></p>
          <p style="font-size: 24px; font-weight: bold; color: #8B1A1A;">${ticketCode}</p>
        </div>
        <p>Save this code for check-in at the event.</p>
        <p>Best regards,<br/>Xplore Nexus Team</p>
      </div>
    `,
  }),

  PAYMENT_RECEIPT: (
    name: string,
    amount: number,
    eventName: string,
    invoiceId: string
  ) => ({
    subject: `Payment Receipt - ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt</h2>
        <p>Hi ${name},</p>
        <p>Payment received for <strong>${eventName}</strong></p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> PHP ${(amount as number).toFixed(2)}</p>
          <p><strong>Invoice ID:</strong> ${invoiceId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Thank you for your purchase!</p>
        <p>Best regards,<br/>Xplore Nexus Team</p>
      </div>
    `,
  }),

  EVENT_REMINDER: (
    name: string,
    eventName: string,
    eventDate: string
  ) => ({
    subject: `Reminder: ${eventName} is coming up!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Reminder</h2>
        <p>Hi ${name},</p>
        <p>This is a reminder that <strong>${eventName}</strong> is happening on:</p>
        <p style="font-size: 18px; font-weight: bold; color: #8B1A1A;">${eventDate}</p>
        <p>Don't forget to join us!</p>
        <p>Best regards,<br/>Xplore Nexus Team</p>
      </div>
    `,
  }),

  TRAINING_COMPLETED: (
    name: string,
    trainingTitle: string,
    certificateNumber: string
  ) => ({
    subject: `Certificate Issued: ${trainingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations!</h2>
        <p>Hi ${name},</p>
        <p>You have successfully completed <strong>${trainingTitle}</strong></p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Certificate Number:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #8B1A1A;">${certificateNumber}</p>
        </div>
        <p>Your certificate has been issued and is ready to download.</p>
        <p>Best regards,<br/>Xplore Nexus Team</p>
      </div>
    `,
  }),
};

// Initialize email transporter
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export interface EmailPayload {
  to: string;
  templateType: string;
  templateData: any[];
}

export async function sendEmail({
  to,
  templateType,
  templateData,
}: EmailPayload) {
  try {
    const template = TEMPLATES[templateType];
    if (!template) {
      throw new Error(`Unknown template: ${templateType}`);
    }

    // Call template function with spread data
    const result = template(...templateData);
    const { subject, html } = result;

    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@xplore.io",
      to,
      subject,
      html,
    };

    const sendResult = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${to}: ${subject}`);
    return { success: true, messageId: sendResult.messageId };
  } catch (error) {
    console.error(`✗ Email error:`, error);
    throw error;
  }
}
