import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    try {
        // We use a balanced pixel ratio (2) and JPEG compression to keep file size down
        // 94MB -> ~2-3MB expected reduction
        const dataUrl = await toJpeg(element, {
            quality: 0.95, // High quality, low file size
            pixelRatio: 2, // Standard Retina resolution
            backgroundColor: '#ffffff',
            width: 1200,
            style: {
                width: '1200px',
                margin: '0',
                padding: '20px'
            }
        });

        // 2. Initialize PDF with compression enabled
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const imgProps = pdf.getImageProperties(dataUrl);

        // 3. Calculate scaling
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // 4. Handle Multi-page
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
        }

        // 5. Save the PDF
        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
