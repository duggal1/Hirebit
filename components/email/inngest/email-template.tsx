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
  jobPostInfo: {
    id: string;
    status: string;
    createDate: string;
    activationDate: string;
  };
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
    subscriptionInfo: {
      planName: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    receiptUrl: string;
  };
}

export const PaymentInvoiceEmail: React.FC<PaymentInvoiceEmailProps> = ({
  companyName,
  jobTitle,
  amount,
  paymentId,
  paymentDetails,
  paymentDate,
  expirationDate,
  jobLocation,
  paymentStatus,
  jobPostInfo,
}) => {

  const toStyleObject = (style: any): StyleObject => {
    return style as StyleObject;
  };

  const formatCurrency = (amount: string) => {
    const [value, currency] = amount.split(" ");
    return `${currency} ${parseFloat(value).toFixed(2)}`;
  };


  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>Payment Confirmation for {jobTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
        <Section style={header}>
  <Img
    src={`${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`}
    width={180}
    height={140}
    alt="Hirebit"
    style={logoStyle as any}
  />
</Section>

         
<Section style={content}>
            <Section style={heroSection}>
              <Text style={toStyleObject(statusWrapper)}>
                <Text style={toStyleObject(status)}>{paymentStatus}</Text>
              </Text>
              <Text style={toStyleObject(amount)}>{formatCurrency(paymentDetails.total)}</Text>
              <Text style={toStyleObject(confirmationText)}>Payment Successfully Processed</Text>
            </Section>

            <Section style={summarySection}>
              <Text style={summaryAmount as StyleObject}>{formatCurrency(paymentDetails.total)}</Text>
              <Text style={summaryLabel as StyleObject}>Total Amount</Text>
              <Section style={summaryDetails}>
                <Text style={summaryItem as StyleObject}>
                  Base: {formatCurrency(paymentDetails.basePrice)}
                </Text>
                <Text style={summaryDivider as StyleObject}>•</Text>
                <Text style={summaryItem as StyleObject}>
                  Tax: {formatCurrency(paymentDetails.taxes)}
                </Text>
              </Section>
            </Section>

            <Section style={infoGrid}>
              <Section style={infoCard}>
                <Text style={cardLabel as StyleObject}>Payment Information</Text>
                <Section style={cardContent}>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Invoice Number</Text>
                    <Text style={detailValue as StyleObject}>{paymentDetails.invoiceNumber}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Payment ID</Text>
                    <Text style={detailValue as StyleObject}>{paymentId}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Payment Date</Text>
                    <Text style={detailValue as StyleObject}>{paymentDate}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Duration</Text>
                    <Text style={detailValue as StyleObject}>{paymentDetails.duration}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Method</Text>
                    <Text style={detailValue as StyleObject}>
                      {paymentDetails.paymentMethod.type.toUpperCase()}
                    </Text>
                  </Section>
                </Section>
              </Section>

              <Section style={infoCard}>
                <Text style={cardLabel as StyleObject}>Job Post Details</Text>
                <Section style={cardContent}>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Job ID</Text>
                    <Text style={detailValue as StyleObject}>{jobPostInfo.id}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Title</Text>
                    <Text style={detailValue as StyleObject}>{jobTitle}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Location</Text>
                    <Text style={detailValue as StyleObject}>{jobLocation}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Status</Text>
                    <Text style={detailValue as StyleObject}>{jobPostInfo.status}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Created</Text>
                    <Text style={detailValue as StyleObject}>{jobPostInfo.createDate}</Text>
                  </Section>
                </Section>
              </Section>

              <Section style={infoCard}>
                <Text style={cardLabel as StyleObject}>Subscription Info</Text>
                <Section style={cardContent}>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Plan</Text>
                    <Text style={detailValue as StyleObject}>{paymentDetails.subscriptionInfo.planName}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Start Date</Text>
                    <Text style={detailValue as StyleObject}>{paymentDetails.subscriptionInfo.startDate}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>End Date</Text>
                    <Text style={detailValue as StyleObject}>{paymentDetails.subscriptionInfo.endDate}</Text>
                  </Section>
                  <Section style={detailRow}>
                    <Text style={detailLabel as StyleObject}>Status</Text>
                    <Text style={detailValue as StyleObject}>{paymentDetails.subscriptionInfo.status}</Text>
                  </Section>
                </Section>
              </Section>
            </Section>

            <Section style={ctaSection}>
              <Link href={paymentDetails.receiptUrl} style={ctaButton as StyleObject}>
                Download Invoice
              </Link>
              <Link 
                href={`${process.env.NEXT_PUBLIC_APP_URL}/jobs/${jobPostInfo.id}`} 
                style={secondaryButton as StyleObject}
              >
                View Job Post
              </Link>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText as StyleObject}>
              Job posting active until <span style={footerHighlight as StyleObject}>{expirationDate}</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main: StyleObject = {
  backgroundColor: "#F4F7FF",
  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  padding: "48px 0",
};

const container: StyleObject = {
  maxWidth: "640px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.04)",
};

const header: StyleObject = {
  padding: "40px",
  backgroundColor: "#ffffff",
  textAlign: "center",
  borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
};

const logoStyle: StyleObject = {
  margin: "0 auto",
};

const content: StyleObject = {
  padding: "0",
};

const heroSection: StyleObject = {
  background: "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)",
  padding: "56px 40px",
  textAlign: "center",
};

const statusWrapper: StyleObject = {
  marginBottom: "24px",
};

const status: StyleObject = {
  fontSize: "13px",
  color: "#2563EB",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: "600",
  backgroundColor: "rgba(37, 99, 235, 0.1)",
  padding: "8px 16px",
  borderRadius: "100px",
  display: "inline-block",
};

const amount: StyleObject = {
  fontSize: "56px",
  lineHeight: "1",
  fontWeight: "700",
  color: "#1E293B",
  margin: "0 0 16px",
  letterSpacing: "-0.03em",
};

const confirmationText: StyleObject = {
  fontSize: "16px",
  color: "#64748B",
  margin: "0",
  fontWeight: "500",
};

const summarySection: StyleObject = {
  padding: "40px",
  textAlign: "center",
  borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
};

const summaryAmount: StyleObject = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1E293B",
  margin: "0 0 8px",
  letterSpacing: "-0.02em",
};

const summaryLabel: StyleObject = {
  fontSize: "14px",
  color: "#64748B",
  marginBottom: "16px",
  fontWeight: "500",
};

const summaryDetails: StyleObject = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
};

const summaryItem: StyleObject = {
  fontSize: "14px",
  color: "#64748B",
  fontWeight: "500",
};

const summaryDivider: StyleObject = {
  color: "#CBD5E1",
};

const infoGrid: StyleObject = {
  padding: "40px",
  display: "grid",
  gap: "24px",
};

const infoCard: StyleObject = {
  backgroundColor: "#F8FAFF",
  borderRadius: "16px",
  padding: "24px",
};

const cardLabel: StyleObject = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#1E293B",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "20px",
};

const cardContent: StyleObject = {
  display: "grid",
  gap: "16px",
};

const detailRow: StyleObject = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const detailLabel: StyleObject = {
  fontSize: "14px",
  color: "#64748B",
  fontWeight: "500",
};

const detailValue: StyleObject = {
  fontSize: "14px",
  color: "#1E293B",
  fontWeight: "600",
};

const addressText: StyleObject = {
  fontSize: "14px",
  color: "#1E293B",
  lineHeight: "1.6",
  margin: "0",
};

const ctaSection: StyleObject = {
  padding: "40px",
  textAlign: "center",
  display: "grid",
  gap: "16px",
};

const ctaButton: StyleObject = {
  backgroundColor: "#2563EB",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  textTransform: "none",
  letterSpacing: "0",
};

const secondaryButton: StyleObject = {
  backgroundColor: "#F1F5F9",
  color: "#1E293B",
  padding: "16px 32px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
};

const footer: StyleObject = {
  padding: "32px 40px",
  backgroundColor: "#F8FAFF",
  textAlign: "center",
};

const footerText: StyleObject = {
  fontSize: "14px",
  color: "#64748B",
  margin: "0",
  fontWeight: "500",
};

const footerHighlight: StyleObject = {
  color: "#1E293B",
  fontWeight: "600",
};

export default PaymentInvoiceEmail;