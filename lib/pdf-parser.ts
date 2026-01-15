import PDFParser from 'pdf2json';

export interface ParsedPDF {
  text: string;
  numPages: number;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ParsedPDF> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        // Extract text from all pages
        const pages = pdfData.Pages || [];
        let fullText = '';
        
        pages.forEach((page, pageIndex) => {
          const texts = page.Texts || [];
          texts.forEach((textItem) => {
            if (textItem.R && textItem.R.length > 0) {
              const text = textItem.R.map((r: { T: string }) => 
                decodeURIComponent(r.T)
              ).join('');
              fullText += text + ' ';
            }
          });
          if (pageIndex < pages.length - 1) {
            fullText += '\n\n';
          }
        });
        
        // Clean up the extracted text
        const cleanText = fullText
          .replace(/\s+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        
        resolve({
          text: cleanText,
          numPages: pages.length,
        });
      } catch (error) {
        reject(new Error(`Failed to process PDF data: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
    
    pdfParser.on('pdfParser_dataError', (errData: { parserError: Error } | Error) => {
      const errorMessage = 'parserError' in errData ? errData.parserError.message : errData.message;
      reject(new Error(`Failed to parse PDF: ${errorMessage}`));
    });
    
    // Parse the PDF buffer
    pdfParser.parseBuffer(buffer);
  });
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Please upload a PDF file.' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB.' };
  }
  
  return { valid: true };
}
