import { createElement } from "react";
import { DocumentProps } from "@react-pdf/renderer";
import { PDFDocument } from 'pdf-lib'

onMessage('getPdfDocumentLink', async ({ data }) => {

    const { pdf } = await import('@react-pdf/renderer');

    const { Ticket } = await import('@/components/Ticket');

    const pdfDocument = pdf(createElement(Ticket, data) as React.ReactElement<DocumentProps>);

    const pdfDocs: Awaited<ReturnType<typeof PDFDocument.load>>[] = []

    data.ticket.attachments.forEach(async attachment => {
        if (attachment.source && attachment.mime_type.includes('image')) {
            const response = await fetch(attachment.source, { method: 'GET' });
            const blob = await response.blob();
            attachment.source = URL.createObjectURL(blob);
        } else if (attachment.source && attachment.mime_type.includes('pdf')) {
            const response = await fetch(attachment.source, { method: 'GET' });
            const buffer = await response.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer);
            pdfDocs.push(pdfDoc);
        }
    });

    const ticketBlob = await pdfDocument.toBlob();

    const ticketBuffer = await ticketBlob.arrayBuffer();

    const ticketDoc = await PDFDocument.load(ticketBuffer);

    pdfDocs.unshift(ticketDoc);

    const combinedPdfs = await PDFDocument.create();

    for await (const pdfDoc of pdfDocs) {
        const copiedPages = await combinedPdfs.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => combinedPdfs.addPage(page));
    }

    const docPdfBase64 = await combinedPdfs.saveAsBase64({ dataUri: true });

    const blob = await base64ToBlob(docPdfBase64);

    const url = URL.createObjectURL(blob);

    return url;
});


async function base64ToBlob(base64DataUrl: string): Promise<Blob> {
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();
    return blob;
}