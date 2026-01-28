import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Enhanced PDF Export that handles multiple elements and ensures they start on new pages.
 */
export const exportToPDF = async (elementIds: string | string[], fileName: string) => {
    const ids = Array.isArray(elementIds) ? elementIds : [elementIds];

    // 1. Initialize PDF
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < ids.length; i++) {
        const element = document.getElementById(ids[i]);
        if (!element) {
            console.warn(`Element with id ${ids[i]} not found, skipping...`);
            continue;
        }

        try {
            // Capture element as high-res image
            const dataUrl = await toJpeg(element, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                width: 1200
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const contentHeight = (imgProps.height * pageWidth) / imgProps.width;

            // If we are on a subsequent section, we ALWAYS start on a new page
            if (i > 0) {
                pdf.addPage();
            }

            // Handle multi-page content within a single section
            let heightLeft = contentHeight;
            let position = 0;

            // Add first page of this section
            pdf.addImage(dataUrl, 'JPEG', 0, position, pageWidth, contentHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // Add subsequent pages if the section is very long
            while (heightLeft > 0) {
                position = heightLeft - contentHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', 0, position, pageWidth, contentHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }
        } catch (error) {
            console.error(`Error capturing section ${ids[i]}:`, error);
        }
    }

    // 5. Save the PDF
    pdf.save(`${fileName}.pdf`);
};
