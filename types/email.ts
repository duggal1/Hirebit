export interface PaymentInvoiceEmailProps {
    companyName: string;
    jobTitle: string;
    amount: string;
    paymentId: string;
    paymentDate: string;
    expirationDate: string;
    jobDuration: string;
    jobLocation: string;
    paymentStatus: string;
  }
  
  export interface EmailResponse {
    id?: string;
    error?: {
      name: string;
      message: string;
    } | null;
    data?: {
      id: string;
    } | null;
  }