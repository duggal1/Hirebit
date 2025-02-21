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
} from "@react-email/components";
import * as React from "react";

// Update the StyleObject type to match React Email's expectations
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
      <Head />
      <Preview>Payment Confirmation for {jobTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="/logo.png"
              width={120}
              height={40}
              alt="Hirebit"
              style={logoStyle as any}
            />
          </Section>

          <Section style={content}>
            <Text style={title as any}>Payment Confirmation</Text>
            <Text style={subtitle as any}>Thank you for your payment</Text>

            <Section style={infoBox}>
              <Section style={infoItem}>
                <Text style={label as any}>Company</Text>
                <Text style={value as any}>{companyName}</Text>
              </Section>
              <Section style={infoItem}>
                <Text style={label as any}>Position</Text>
                <Text style={value as any}>{jobTitle}</Text>
              </Section>
              <Section style={infoItem}>
                <Text style={label as any}>Location</Text>
                <Text style={value as any}>{jobLocation}</Text>
              </Section>
            </Section>

            <Section style={paymentBox}>
              <Text style={amount as any}>{amount}</Text>
              <Text style={status as any}>{paymentStatus}</Text>
              <Section style={paymentDetails}>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Payment ID</Text>
                  <Text style={detailValue as any}>{paymentId}</Text>
                </Section>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Payment Date</Text>
                  <Text style={detailValue as any}>{paymentDate}</Text>
                </Section>
                <Section style={detailRow}>
                  <Text style={detailLabel as any}>Expiration Date</Text>
                  <Text style={detailValue as any}>{expirationDate}</Text>
                </Section>
              </Section>
            </Section>
          </Section>

          <Hr style={divider as any} />

          <Text style={footer as any}>
            Your job posting will be active until {expirationDate}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};


// Style definitions with proper typing
const main: StyleObject = {
  backgroundColor: "#f6f9fc",
  padding: "30px 0",
};

const container: StyleObject = {
  maxWidth: "500px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
};

const header: StyleObject = {
  padding: "20px",
  backgroundColor: "#f8fafc",
  textAlign: "center",
};

const logoStyle: StyleObject = {
  margin: "0 auto",
};

const content: StyleObject = {
  padding: "32px 24px",
};

const title: StyleObject = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  textAlign: "center",
  margin: "0 0 8px",
};

const subtitle: StyleObject  = {
  fontSize: "16px",
  color: "#666666",
  textAlign: "center",
  margin: "0 0 32px",
};

const infoBox: StyleObject  = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const infoItem: StyleObject  = {
  marginBottom: "12px",
};

const label: StyleObject  = {
  fontSize: "14px",
  color: "#666666",
  marginBottom: "4px",
};

const value: StyleObject  = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "500",
};

const paymentBox: StyleObject  = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
};

const amount: StyleObject  = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1a1a1a",
  textAlign: "center",
  margin: "0 0 8px",
};

const status: StyleObject  = {
  fontSize: "14px",
  color: "#10b981",
  textAlign: "center",
  textTransform: "uppercase",
  margin: "0 0 24px",
};

const paymentDetails: StyleObject  = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: "16px",
};

const detailRow: StyleObject  = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const detailLabel: StyleObject  = {
  fontSize: "14px",
  color: "#666666",
};


const detailValue: StyleObject  = {
  fontSize: "14px",
  color: "#1a1a1a",
  fontWeight: "500",
};

const divider: StyleObject  = {
  margin: "32px 0",
  borderTop: "1px solid #e5e7eb",
};

const footer :StyleObject  = {
  fontSize: "14px",
  color: "#666666",
  textAlign: "center",
  padding: "0 24px 32px",
};

export default PaymentInvoiceEmail;
