// types.ts - Type definitions
interface PaymentSlipData {
  employeeName: string;
  jobTitle: string;
  hoursWorked: number;
  hourlyRate: number;
  bonuses: number;
  deductions: number;
  paymentMethod: string;
  transactionId: string;
  jobDescription: string;
}

interface PaymentSlipCalculation extends PaymentSlipData {
  totalPay: string;
}

// Extend the Window interface to include jsPDF
declare global {
  interface Window {
    jspdf: {
      jsPDF: new () => jsPDFDocument;
    };
  }
}

// Basic jsPDF interface (you might want to use @types/jspdf for full typing)
interface jsPDFDocument {
  text(text: string, x: number, y: number): void;
  addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): void;
  save(filename: string): void;
}

// paymentSlipGenerator.ts - Main application logic
class PaymentSlipGenerator {
  private readonly CURRENCY_SYMBOL = '$';
  
  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    const generateButton = document.querySelector('button[onclick="generateSlip()"]') as HTMLButtonElement;
    if (generateButton) {
      generateButton.removeAttribute('onclick');
      generateButton.addEventListener('click', () => this.generateSlip());
    }
  }

  private getElementValue(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
    return element?.value || '';
  }

  private getNumericValue(id: string, defaultValue: number = 0): number {
    const value = this.getElementValue(id);
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getFileInput(): File | null {
    const fileInput = document.getElementById('evidenceImage') as HTMLInputElement;
    return fileInput?.files?.[0] || null;
  }

  private collectFormData(): PaymentSlipData {
    return {
      employeeName: this.getElementValue('employeeName'),
      jobTitle: this.getElementValue('jobTitle'),
      hoursWorked: this.getNumericValue('hoursWorked'),
      hourlyRate: this.getNumericValue('hourlyRate'),
      bonuses: this.getNumericValue('bonuses'),
      deductions: this.getNumericValue('deductions'),
      paymentMethod: this.getElementValue('paymentMethod'),
      transactionId: this.getElementValue('transactionId'),
      jobDescription: this.getElementValue('jobDescription')
    };
  }

  private calculateTotalPay(data: PaymentSlipData): PaymentSlipCalculation {
    const totalPay = (data.hoursWorked * data.hourlyRate + data.bonuses - data.deductions).toFixed(2);
    return { ...data, totalPay };
  }

  private validateFormData(data: PaymentSlipData): string[] {
    const errors: string[] = [];

    if (!data.employeeName.trim()) {
      errors.push('Employee name is required');
    }

    if (!data.jobTitle.trim()) {
      errors.push('Job title is required');
    }

    if (data.hoursWorked <= 0) {
      errors.push('Hours worked must be greater than 0');
    }

    if (data.hourlyRate <= 0) {
      errors.push('Hourly rate must be greater than 0');
    }

    return errors;
  }

  private createPDFContent(doc: jsPDFDocument, data: PaymentSlipCalculation): void {
    const lineHeight = 10;
    let yPosition = 10;

    const addLine = (text: string): void => {
      doc.text(text, 10, yPosition);
      yPosition += lineHeight;
    };

    addLine("Job Payment Slip");
    addLine(`Employee: ${data.employeeName}`);
    addLine(`Job Title: ${data.jobTitle}`);
    addLine(`Job Description: ${data.jobDescription}`);
    addLine(`Hours: ${data.hoursWorked}`);
    addLine(`Rate: ${this.CURRENCY_SYMBOL}${data.hourlyRate}`);
    addLine(`Bonuses: ${this.CURRENCY_SYMBOL}${data.bonuses}`);
    addLine(`Deductions: ${this.CURRENCY_SYMBOL}${data.deductions}`);
    addLine(`Payment Method: ${data.paymentMethod}`);
    addLine(`Transaction ID: ${data.transactionId}`);
    addLine(`Total Pay: ${this.CURRENCY_SYMBOL}${data.totalPay}`);
  }

  private async addImageToPDF(doc: jsPDFDocument, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        try {
          const imgData = e.target?.result as string;
          if (imgData) {
            doc.addImage(imgData, 'JPEG', 10, 120, 60, 60);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (): void => {
        reject(new Error('Failed to read image file'));
      };

      reader.readAsDataURL(file);
    });
  }

  private generateFileName(employeeName: string): string {
    const sanitizedName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `PaymentSlip_${sanitizedName}_${timestamp}.pdf`;
  }

  private showError(message: string): void {
    alert(`Error: ${message}`);
  }

  private showErrors(errors: string[]): void {
    const errorMessage = errors.join('\n');
    this.showError(errorMessage);
  }

  public async generateSlip(): Promise<void> {
    try {
      // Check if jsPDF is available
      if (!window.jspdf) {
        throw new Error('jsPDF library is not loaded');
      }

      const formData = this.collectFormData();
      const validationErrors = this.validateFormData(formData);

      if (validationErrors.length > 0) {
        this.showErrors(validationErrors);
        return;
      }

      const calculatedData = this.calculateTotalPay(formData);
      const doc = new window.jspdf.jsPDF();

      this.createPDFContent(doc, calculatedData);

      const file = this.getFileInput();
      if (file) {
        await this.addImageToPDF(doc, file);
      }

      const fileName = this.generateFileName(calculatedData.employeeName);
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating payment slip:', error);
      this.showError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
}

// app.ts - Application initialization
class App {
  private paymentSlipGenerator: PaymentSlipGenerator;

  constructor() {
    this.paymentSlipGenerator = new PaymentSlipGenerator();
  }

  public init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Payment Slip Generator initialized');
    });
  }
}

// Initialize the application
const app = new App();
app.init();

// Export for potential module usage
export { App, PaymentSlipGenerator };
export type { PaymentSlipCalculation, PaymentSlipData };

