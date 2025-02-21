import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Img,
  Link,
} from "@react-email/components";
import * as React from "react";

interface StyleObject {
  [key: string]: string | number | undefined;
}


interface PaymentInvoiceEmailProps {
  companyName: string;
  jobTitle: string;
  amount: string;
  paymentId: string;
  paymentDate: string;
  expirationDate: string;
  jobLocation: string;
  paymentStatus: string;
  paymentDetails: {
    basePrice: string;
    taxes: string;
    total: string;
    duration: string;
    invoiceNumber: string;
    billingAddress: {
      country: string;
      city?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    paymentMethod: {
      type: string;
      details: any;
    };
    receiptUrl: string;
  };
}

export const PaymentInvoiceEmail: React.FC<PaymentInvoiceEmailProps> = ({
  companyName,
  jobTitle,
  amount,
  paymentId,
  paymentDate,
  expirationDate,
  jobLocation,
  paymentStatus,
}) => {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>Payment Confirmation for {jobTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="/logo.png"
              width={140}
              height={45}
              alt="Hirebit"
              style={logoStyle as any}
            />
          </Section>

          <Section style={content}>
            <Section style={heroSection}>
              <Text style={amount as any}>{amount}</Text>
              <Text style={status as any}>{paymentStatus}</Text>
              <Text style={confirmationText as any}>Payment Confirmed</Text>
            </Section>

            <Section style={infoContainer}>
              <Section style={infoColumn}>
                <Text style={columnLabel as any}>Payment Details</Text>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>ID</Text>
                  <Text style={detailValue as any}>{paymentId}</Text>
                </Section>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Date</Text>
                  <Text style={detailValue as any}>{paymentDate}</Text>
                </Section>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Expires</Text>
                  <Text style={detailValue as any}>{expirationDate}</Text>
                </Section>
              </Section>

              <Section style={infoColumn}>
                <Text style={columnLabel as any}>Job Information</Text>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Company</Text>
                  <Text style={detailValue as any}>{companyName}</Text>
                </Section>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Position</Text>
                  <Text style={detailValue as any}>{jobTitle}</Text>
                </Section>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Location</Text>
                  <Text style={detailValue as any}>{jobLocation}</Text>
                </Section>
              </Section>
            </Section>

            <Section style={ctaSection}>
              <Link href="#" style={ctaButton as any}>
                View Full Invoice
              </Link>
            </Section>
          </Section>

          <Hr style={divider as any} />

          <Section style={footer}>
            <Text style={footerText as any}>
              Your job posting will remain active until
            </Text>
            <Text style={footerHighlight as any}>{expirationDate}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main: StyleObject = {
  backgroundColor: "#FAFAFA",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  padding: "40px 0",
};

const container: StyleObject = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)",
};

const header: StyleObject = {
  padding: "32px",
  backgroundColor: "#ffffff",
  textAlign: "center",
  borderBottom: "1px solid #f1f1f1",
};

const logoStyle: StyleObject = {
  margin: "0 auto",
};

const content: StyleObject = {
  padding: "0",
};

const heroSection: StyleObject = {
  backgroundColor: "#F8FAFC",
  padding: "48px 32px",
  textAlign: "center",
};

const amount: StyleObject = {
  fontSize: "48px",
  lineHeight: "1",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 16px",
  letterSpacing: "-0.02em",
};

const status: StyleObject = {
  fontSize: "14px",
  color: "#059669",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: "600",
  backgroundColor: "#ECFDF5",
  padding: "6px 12px",
  borderRadius: "6px",
  display: "inline-block",
  margin: "0 0 16px",
};

const confirmationText: StyleObject = {
  fontSize: "16px",
  color: "#6B7280",
  margin: "0",
};

const infoContainer: StyleObject = {
  padding: "32px",
  display: "flex",
  gap: "32px",
};

const infoColumn: StyleObject = {
  flex: "1",
};

const columnLabel: StyleObject = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111827",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "16px",
};

const detailRow: StyleObject = {
  marginBottom: "12px",
};

const detailLabel: StyleObject = {
  fontSize: "14px",
  color: "#6B7280",
  marginBottom: "4px",
};

const detailValue: StyleObject = {
  fontSize: "15px",
  color: "#111827",
  fontWeight: "500",
};

const ctaSection: StyleObject = {
  padding: "32px",
  textAlign: "center",
};

const ctaButton: StyleObject = {
  backgroundColor: "#111827",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  display: "inline-block",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const divider: StyleObject = {
  margin: "0",
  borderTop: "1px solid #f1f1f1",
};

const footer: StyleObject = {
  padding: "32px",
  textAlign: "center",
};

const footerText: StyleObject = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "0 0 4px",
};

const footerHighlight: StyleObject = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: "600",
  margin: "0",
};

export default PaymentInvoiceEmail;