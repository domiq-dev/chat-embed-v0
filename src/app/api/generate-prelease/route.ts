import { NextRequest } from 'next/server';
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'; // Standalone version

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { fullName, moveInDate, apartmentSize, incomeQualified, evictionStatus } = body;

    const bodyFontUrl =
      'https://raw.githubusercontent.com/google/fonts/main/apache/arimo/Arimo%5Bwght%5D.ttf';
    const bodyFontBuffer = await fetch(bodyFontUrl)
      .then((res) => res.arrayBuffer())
      .then((buf) => Buffer.from(buf));

    // Fetch signature font (Pacifico)
    const signatureFontUrl =
      'https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf';
    const signatureFontBuffer = await fetch(signatureFontUrl)
      .then((res) => res.arrayBuffer())
      .then((buf) => Buffer.from(buf));

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    // Register both fonts
    doc.registerFont('Body-Regular', bodyFontBuffer);
    doc.registerFont('Signature-Regular', signatureFontBuffer);

    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('error', (e) => {
      throw e;
    });

    const todayDate = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
    });

    doc
      .font('Body-Regular')
      .fontSize(18)
      .text('Grand Oaks Apartments', { align: 'center' })
      .text('Pre-Qualification Form', { align: 'center' })
      .moveDown(2)

      .fontSize(12)
      .text(
        `This Pre-Qualification Form ("Form") is entered into between Grand Oaks Apartments ("Landlord") and ${fullName} ("Applicant") on the date of ${todayDate}.`,
      )
      .moveDown()

      .text('1. Applicant Information:')
      .text(`   - Full Name: ${fullName}`)
      .text(`   - Desired Move-In Date: ${moveInDate}`)
      .text(`   - Requested Apartment Size: ${apartmentSize}`)
      .moveDown()

      .text('2. Applicant Qualifications:')
      .text(`   - Income Qualification: ${incomeQualified ? 'Yes' : 'No'}`)
      .text(`   - Prior Evictions: ${evictionStatus ? 'Yes' : 'No'}`)
      .moveDown()

      .text('3. Purpose of Form:')
      .text(
        '   This Form serves to reserve an apartment home for the Applicant, subject to the approval of a full application, credit and background screening, and signing of the standard lease contract.',
      )
      .moveDown()

      .text('4. Non-Binding Nature:')
      .text(
        '   This Form does NOT constitute a binding lease agreement. Final lease execution is contingent upon full application approval.',
      )
      .moveDown()

      .text('5. Application Fee:')
      .text(
        '   Applicant agrees to pay all applicable application and administrative fees at the time of completing the formal lease process.',
      )
      .moveDown()

      .text('6. Governing Law:')
      .text('   This Form shall be governed by the laws of the State of North Carolina.')
      .moveDown(3)

      .text('Applicant Signature:')
      .moveDown(1);

    // Switch to Signature Font
    doc.font('Signature-Regular').fontSize(26).text(fullName, { underline: true }).moveDown(1);

    // Back to Body Font for Date
    doc.font('Body-Regular').fontSize(12).text(`Date: ${todayDate}`);

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks))),
    );

    const safeFullName = fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); // clean up spaces and special characters

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pre-qualification-${safeFullName}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation failed ⇒', err);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
    });
  }
}
