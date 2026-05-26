import { PDFDocument, rgb, degrees } from "pdf-lib";
// @ts-ignore - qrcode type declaration
import QRCode from "qrcode";

export interface CertificateData {
  recipientName: string;
  certificateNumber: string;
  certificationTitle: string;
  issuedDate: Date;
  instructorName?: string;
  organizationName?: string;
}

export async function generateCertificate(data: CertificateData): Promise<Buffer> {
  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([850, 600]);
  const { width, height } = page.getSize();

  // Background color (light beige)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: rgb(0.97, 0.96, 0.93),
  });

  // Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.55, 0.1, 0.1),
    borderWidth: 3,
  });

  // Inner decorative border
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.8, 0.7, 0.5),
    borderWidth: 1,
  });

  // Title
  page.drawText("Certificate of Completion", {
    x: width / 2 - 150,
    y: height - 100,
    size: 36,
    color: rgb(0.55, 0.1, 0.1),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  // "This certifies that" text
  page.drawText("This certifies that", {
    x: width / 2 - 70,
    y: height - 160,
    size: 14,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Recipient name
  page.drawText(data.recipientName, {
    x: width / 2 - (data.recipientName.length * 5), // Rough centering
    y: height - 210,
    size: 28,
    color: rgb(0.55, 0.1, 0.1),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  // Underline for name
  page.drawRectangle({
    x: 100,
    y: height - 230,
    width: width - 200,
    height: 1,
    color: rgb(0.55, 0.1, 0.1),
  });

  // Achievement text
  page.drawText(
    `has successfully completed the training course in`,
    {
      x: width / 2 - 140,
      y: height - 280,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    }
  );

  // Course/Training title
  page.drawText(data.certificationTitle, {
    x: width / 2 - (data.certificationTitle.length * 3),
    y: height - 320,
    size: 18,
    color: rgb(0.55, 0.1, 0.1),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  // Issue date
  const issuedDateStr = data.issuedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  page.drawText(`Issued on: ${issuedDateStr}`, {
    x: 60,
    y: 120,
    size: 11,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Certificate number
  page.drawText(`Certificate #: ${data.certificateNumber}`, {
    x: 60,
    y: 90,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  // QR Code (verification)
  try {
    const qrCodeUrl = await QRCode.toDataURL(data.certificateNumber, {
      type: "image/png",
      width: 100,
      margin: 1,
    });

    const qrImage = await pdfDoc.embedPng(qrCodeUrl);
    page.drawImage(qrImage, {
      x: width - 130,
      y: 60,
      width: 100,
      height: 100,
    });
  } catch (qrError) {
    console.error("QR code generation error:", qrError);
  }

  // Signature line
  page.drawRectangle({
    x: width / 2 - 100,
    y: 130,
    width: 200,
    height: 1,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText("Authorized Signature", {
    x: width / 2 - 60,
    y: 110,
    size: 10,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Organization name at bottom
  if (data.organizationName) {
    page.drawText(data.organizationName, {
      x: width / 2 - 50,
      y: 30,
      size: 12,
      color: rgb(0.55, 0.1, 0.1),
      font: await pdfDoc.embedFont("Helvetica-Bold"),
    });
  }

  // Convert to buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
