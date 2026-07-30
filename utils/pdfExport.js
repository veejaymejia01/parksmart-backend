import PDFDocument from 'pdfkit';

export const generateReportPDF = (reportData, title) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      if (Array.isArray(reportData)) {
        reportData.forEach((item, index) => {
          doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(item, null, 2)}`);
          doc.moveDown();
        });
      } else {
        doc.fontSize(12).text(JSON.stringify(reportData, null, 2));
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generateReportPDF;

