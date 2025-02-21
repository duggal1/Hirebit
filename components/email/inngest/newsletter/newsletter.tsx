import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Row,
    Column,
    Link,
    Button,
  } from "@react-email/components";
  import * as React from "react";
  
  interface CompanyData {
    id: string;
    name: string;
    industry: string;
    location: string;
    activeJobCount: number;
    totalJobCount: number;
    techStack: string[];
  }
  
  interface CompanyMetrics {
    totalViews: number;
    totalClicks: number;
    applications: number;
    ctr: number;
    conversionRate: number;
    viewsByDate: Record<string, number>;
    clicksByDate: Record<string, number>;
    locationData: string; // Changed to string since it's stored as JSON string in DB
    topCandidateMatch?: string;
    candidateMatchScores?: string;
    skillsMatchData?: string;
    marketTrends?: {
      competitorBenchmark?: any;
      marketSalaryData?: any;
      marketSkillsData?: any;
      industryTrends?: any;
    };
  }
  
  interface NewsletterEmailProps {
    company: CompanyData;
    metrics: CompanyMetrics;
    recipientEmail: string;
  }
  export const NewsletterEmail: React.FC<NewsletterEmailProps> = ({
    company,
    metrics,
    recipientEmail,
  }) => {
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString();
  
    return (
      <Html>
        <Head />
        <Preview>
          {company.name} Hiring Analytics - Weekly Insights from Hirebit
        </Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={header}>
              {company.name} Weekly Hiring Insights
            </Heading>
  
            <Section style={metrics}>
              <Heading style={subheader}>Performance Overview</Heading>
              <Row style={row}>
                <Column style={column}>
                  <Text style={stat}>{metrics.totalViews}</Text>
                  <Text style={label}>Total Views</Text>
                </Column>
                <Column style={column}>
                  <Text style={stat}>{metrics.totalClicks}</Text>
                  <Text style={label}>Total Clicks</Text>
                </Column>
                <Column style={column}>
                  <Text style={stat}>{metrics.applications}</Text>
                  <Text style={label}>Applications</Text>
                </Column>
              </Row>
              <Row style={row}>
                <Column style={column}>
                  <Text style={stat}>{formatPercent(metrics.ctr)}</Text>
                  <Text style={label}>Click-through Rate</Text>
                </Column>
                <Column style={column}>
                  <Text style={stat}>{formatPercent(metrics.conversionRate)}</Text>
                  <Text style={label}>Conversion Rate</Text>
                </Column>
              </Row>
            </Section>
  
            <Section style={insights}>
              <Heading style={subheader}>Key Insights</Heading>
              <Text style={text}>
                • Your job posts are performing {metrics.ctr > 35 ? "above" : "below"} industry average with a {formatPercent(metrics.ctr)} click-through rate
              </Text>
              <Text style={text}>
                • Applications conversion rate is {formatPercent(metrics.conversionRate)}, showing strong candidate interest
              </Text>
              <Text style={text}>
                • Most active regions: {JSON.parse(metrics.locationData || "{}")["stockhome , sweden"] ? "Stockholm, Sweden" : "Various Locations"}
              </Text>
            </Section>
  
            <Section style={recommendations}>
              <Heading style={subheader}>Recommendations</Heading>
              <Text style={text}>
                Based on your metrics, we recommend:
              </Text>
              <ul style={list}>
                <li style={listItem}>
                  {metrics.ctr < 35 ? "Enhance job titles and descriptions for better visibility" : "Maintain your strong job post engagement"}
                </li>
                <li style={listItem}>
                  Consider expanding your reach to more locations
                </li>
                <li style={listItem}>
                  Update your tech stack to attract more qualified candidates
                </li>
              </ul>
            </Section>
  
            <Section style={callToAction}>
              <Button 
                href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
                style={button}
              >
                View Full Analytics
              </Button>
            </Section>
  
            <Section style={footer}>
              <Text style={footerText}>
                You're receiving this because you're a valued member of Hirebit.
                <Link 
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email=${recipientEmail}`}
                  style={unsubscribe}
                >
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  // Styles
  const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, sans-serif',
  };
  
  const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "580px",
  };
  
  const header = {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center" as const,
  };
  
  const subheader = {
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: "600",
    color: "#374151",
    marginTop: "24px",
  };
  
  const metrics = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginTop: "24px",
  };
  
  const row = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  };
  
  const column = {
    textAlign: "center" as const,
  };
  
  const stat = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0",
  };
  
  const label = {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 0",
  };
  
  const insights = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginTop: "24px",
  };
  
  const recommendations = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginTop: "24px",
  };
  
  const text = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#374151",
    margin: "8px 0",
  };
  
  const list = {
    paddingLeft: "20px",
    margin: "16px 0",
  };
  
  const listItem = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#374151",
    margin: "8px 0",
  };
  
  const callToAction = {
    textAlign: "center" as const,
    marginTop: "32px",
  };
  
  const button = {
    backgroundColor: "#0070f3",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
  };
  
  const footer = {
    textAlign: "center" as const,
    marginTop: "32px",
  };
  
  const footerText = {
    fontSize: "14px",
    color: "#6b7280",
  };
  
  const unsubscribe = {
    color: "#6b7280",
    textDecoration: "underline",
    marginLeft: "8px",
  };