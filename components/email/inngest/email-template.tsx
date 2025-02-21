import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
  Img,
} from "@react-email/components";
import * as React from 'react';
import { PaymentInvoiceEmailProps } from "@/types/email";

export const PaymentInvoiceEmail = ({
  companyName,
  jobTitle,
  amount,
  paymentId,
  paymentDate,
  expirationDate,
  jobDuration,
  jobLocation,
  paymentStatus
}: PaymentInvoiceEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Payment Invoice for Your Job Posting on Hirebit</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="140"
              height="40"
              alt="Hirebit"
            />
          </Section>
  
            {/* Main Content */}
            <Section style={content}>
              <Text style={title}>Payment Invoice</Text>
              <Text style={subtitle}>
                Thank you for posting a job on Hirebit!
              </Text>
  
              {/* Payment Details */}
              <Section style={detailsContainer}>
                <Row>
                  <Column>
                    <Text style={labelText}>Company</Text>
                    <Text style={valueText}>{companyName}</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Amount Paid</Text>
                    <Text style={valueText}>{amount}</Text>
                  </Column>
                </Row>
                
                <Hr style={divider} />
                
                <Row>
                  <Column>
                    <Text style={labelText}>Job Title</Text>
                    <Text style={valueText}>{jobTitle}</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Location</Text>
                    <Text style={valueText}>{jobLocation}</Text>
                  </Column>
                </Row>
                
                <Hr style={divider} />
  
                <Row>
                  <Column>
                    <Text style={labelText}>Payment Date</Text>
                    <Text style={valueText}>{paymentDate}</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Payment Status</Text>
                    <Text style={valueText}>{paymentStatus}</Text>
                  </Column>
                </Row>
                
                <Hr style={divider} />
  
                <Row>
                  <Column>
                    <Text style={labelText}>Duration</Text>
                    <Text style={valueText}>{jobDuration}</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Expiration Date</Text>
                    <Text style={valueText}>{expirationDate}</Text>
                  </Column>
                </Row>
                
                <Hr style={divider} />
  
                <Text style={labelText}>Payment ID</Text>
                <Text style={valueText}>{paymentId}</Text>
              </Section>
  
              {/* Footer Note */}
              <Text style={footerText}>
                Your job posting will be active until {expirationDate}. You'll receive a 
                notification before the expiration date.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  export default PaymentInvoiceEmail;
  
  // Styles
  const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    borderRadius: "12px",
    maxWidth: "600px",
  };
  
  const header = {
    padding: "32px 48px 0",
  };
  
  const content = {
    padding: "0 48px",
  };
  
  const title = {
    fontSize: "32px",
    fontWeight: "600",
    color: "#000",
    marginBottom: "4px",
  };
  
  const subtitle = {
    fontSize: "16px",
    color: "#666",
    marginTop: "0",
    marginBottom: "24px",
  };
  
  const detailsContainer = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
  };
  
  const labelText = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  };
  
  const valueText = {
    fontSize: "16px",
    color: "#000",
    fontWeight: "500",
    marginTop: "0",
    marginBottom: "16px",
  };
  
  const divider = {
    borderTop: "1px solid #e6e6e6",
    margin: "16px 0",
  };
  
  const footerText = {
    fontSize: "14px",
    color: "#666",
    marginTop: "32px",
    fontStyle: "italic",
  };