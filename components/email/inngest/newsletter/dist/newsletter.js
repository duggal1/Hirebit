"use strict";
exports.__esModule = true;
exports.NewsletterEmail = void 0;
var components_1 = require("@react-email/components");
var React = require("react");
exports.NewsletterEmail = function (_a) {
    var company = _a.company, metrics = _a.metrics, recipientEmail = _a.recipientEmail;
    var formatPercent = function (num) { return num.toFixed(1) + "%"; };
    var formatDate = function (date) { return new Date(date).toLocaleDateString(); };
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null,
            company.name,
            " Hiring Analytics - Weekly Insights from Hirebit"),
        React.createElement(components_1.Body, { style: main },
            React.createElement(components_1.Container, { style: container },
                React.createElement(components_1.Heading, { style: header },
                    company.name,
                    " Weekly Hiring Insights"),
                React.createElement(components_1.Section, { style: metrics },
                    React.createElement(components_1.Heading, { style: subheader }, "Performance Overview"),
                    React.createElement(components_1.Row, { style: row },
                        React.createElement(components_1.Column, { style: column },
                            React.createElement(components_1.Text, { style: stat }, metrics.totalViews),
                            React.createElement(components_1.Text, { style: label }, "Total Views")),
                        React.createElement(components_1.Column, { style: column },
                            React.createElement(components_1.Text, { style: stat }, metrics.totalClicks),
                            React.createElement(components_1.Text, { style: label }, "Total Clicks")),
                        React.createElement(components_1.Column, { style: column },
                            React.createElement(components_1.Text, { style: stat }, metrics.applications),
                            React.createElement(components_1.Text, { style: label }, "Applications"))),
                    React.createElement(components_1.Row, { style: row },
                        React.createElement(components_1.Column, { style: column },
                            React.createElement(components_1.Text, { style: stat }, formatPercent(metrics.ctr)),
                            React.createElement(components_1.Text, { style: label }, "Click-through Rate")),
                        React.createElement(components_1.Column, { style: column },
                            React.createElement(components_1.Text, { style: stat }, formatPercent(metrics.conversionRate)),
                            React.createElement(components_1.Text, { style: label }, "Conversion Rate")))),
                React.createElement(components_1.Section, { style: insights },
                    React.createElement(components_1.Heading, { style: subheader }, "Key Insights"),
                    React.createElement(components_1.Text, { style: text },
                        "\u2022 Your job posts are performing ",
                        metrics.ctr > 35 ? "above" : "below",
                        " industry average with a ",
                        formatPercent(metrics.ctr),
                        " click-through rate"),
                    React.createElement(components_1.Text, { style: text },
                        "\u2022 Applications conversion rate is ",
                        formatPercent(metrics.conversionRate),
                        ", showing strong candidate interest"),
                    React.createElement(components_1.Text, { style: text },
                        "\u2022 Most active regions: ",
                        JSON.parse(metrics.locationData || "{}")["stockhome , sweden"] ? "Stockholm, Sweden" : "Various Locations")),
                React.createElement(components_1.Section, { style: recommendations },
                    React.createElement(components_1.Heading, { style: subheader }, "Recommendations"),
                    React.createElement(components_1.Text, { style: text }, "Based on your metrics, we recommend:"),
                    React.createElement("ul", { style: list },
                        React.createElement("li", { style: listItem }, metrics.ctr < 35 ? "Enhance job titles and descriptions for better visibility" : "Maintain your strong job post engagement"),
                        React.createElement("li", { style: listItem }, "Consider expanding your reach to more locations"),
                        React.createElement("li", { style: listItem }, "Update your tech stack to attract more qualified candidates"))),
                React.createElement(components_1.Section, { style: callToAction },
                    React.createElement(components_1.Button, { href: process.env.NEXT_PUBLIC_APP_URL + "/dashboard", style: button }, "View Full Analytics")),
                React.createElement(components_1.Section, { style: footer },
                    React.createElement(components_1.Text, { style: footerText },
                        "You're receiving this because you're a valued member of Hirebit.",
                        React.createElement(components_1.Link, { href: process.env.NEXT_PUBLIC_APP_URL + "/api/newsletter/unsubscribe?email=" + recipientEmail, style: unsubscribe }, "Unsubscribe")))))));
};
// Styles
var main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, sans-serif'
};
var container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "580px"
};
var header = {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center"
};
var subheader = {
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: "600",
    color: "#374151",
    marginTop: "24px"
};
var metrics = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginTop: "24px"
};
var row = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
};
var column = {
    textAlign: "center"
};
var stat = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0"
};
var label = {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 0"
};
var insights = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginTop: "24px"
};
var recommendations = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginTop: "24px"
};
var text = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#374151",
    margin: "8px 0"
};
var list = {
    paddingLeft: "20px",
    margin: "16px 0"
};
var listItem = {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#374151",
    margin: "8px 0"
};
var callToAction = {
    textAlign: "center",
    marginTop: "32px"
};
var button = {
    backgroundColor: "#0070f3",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
    textDecoration: "none",
    textAlign: "center",
    padding: "12px 24px"
};
var footer = {
    textAlign: "center",
    marginTop: "32px"
};
var footerText = {
    fontSize: "14px",
    color: "#6b7280"
};
var unsubscribe = {
    color: "#6b7280",
    textDecoration: "underline",
    marginLeft: "8px"
};
