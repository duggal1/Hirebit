"use strict";
exports.__esModule = true;
exports.PaymentInvoiceEmail = void 0;
var components_1 = require("@react-email/components");
var React = require("react");
exports.PaymentInvoiceEmail = function (_a) {
    var companyName = _a.companyName, jobTitle = _a.jobTitle, amount = _a.amount, paymentId = _a.paymentId, paymentDate = _a.paymentDate, expirationDate = _a.expirationDate, jobLocation = _a.jobLocation, paymentStatus = _a.paymentStatus;
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null,
            React.createElement("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
            React.createElement("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" }),
            React.createElement("link", { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap", rel: "stylesheet" })),
        React.createElement(components_1.Preview, null,
            "Payment Confirmation for ",
            jobTitle),
        React.createElement(components_1.Body, { style: main },
            React.createElement(components_1.Container, { style: container },
                React.createElement(components_1.Section, { style: header },
                    React.createElement(components_1.Img, { src: "/logo.png", width: 140, height: 45, alt: "Hirebit", style: logoStyle })),
                React.createElement(components_1.Section, { style: content },
                    React.createElement(components_1.Section, { style: heroSection },
                        React.createElement(components_1.Text, { style: amount }, amount),
                        React.createElement(components_1.Text, { style: status }, paymentStatus),
                        React.createElement(components_1.Text, { style: confirmationText }, "Payment Confirmed")),
                    React.createElement(components_1.Section, { style: infoContainer },
                        React.createElement(components_1.Section, { style: infoColumn },
                            React.createElement(components_1.Text, { style: columnLabel }, "Payment Details"),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "ID"),
                                React.createElement(components_1.Text, { style: detailValue }, paymentId)),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Date"),
                                React.createElement(components_1.Text, { style: detailValue }, paymentDate)),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Expires"),
                                React.createElement(components_1.Text, { style: detailValue }, expirationDate))),
                        React.createElement(components_1.Section, { style: infoColumn },
                            React.createElement(components_1.Text, { style: columnLabel }, "Job Information"),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Company"),
                                React.createElement(components_1.Text, { style: detailValue }, companyName)),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Position"),
                                React.createElement(components_1.Text, { style: detailValue }, jobTitle)),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Location"),
                                React.createElement(components_1.Text, { style: detailValue }, jobLocation)))),
                    React.createElement(components_1.Section, { style: ctaSection },
                        React.createElement(components_1.Link, { href: "#", style: ctaButton }, "View Full Invoice"))),
                React.createElement(components_1.Hr, { style: divider }),
                React.createElement(components_1.Section, { style: footer },
                    React.createElement(components_1.Text, { style: footerText }, "Your job posting will remain active until"),
                    React.createElement(components_1.Text, { style: footerHighlight }, expirationDate))))));
};
var main = {
    backgroundColor: "#FAFAFA",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    padding: "40px 0"
};
var container = {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)"
};
var header = {
    padding: "32px",
    backgroundColor: "#ffffff",
    textAlign: "center",
    borderBottom: "1px solid #f1f1f1"
};
var logoStyle = {
    margin: "0 auto"
};
var content = {
    padding: "0"
};
var heroSection = {
    backgroundColor: "#F8FAFC",
    padding: "48px 32px",
    textAlign: "center"
};
var amount = {
    fontSize: "48px",
    lineHeight: "1",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 16px",
    letterSpacing: "-0.02em"
};
var status = {
    fontSize: "14px",
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: "600",
    backgroundColor: "#ECFDF5",
    padding: "6px 12px",
    borderRadius: "6px",
    display: "inline-block",
    margin: "0 0 16px"
};
var confirmationText = {
    fontSize: "16px",
    color: "#6B7280",
    margin: "0"
};
var infoContainer = {
    padding: "32px",
    display: "flex",
    gap: "32px"
};
var infoColumn = {
    flex: "1"
};
var columnLabel = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "16px"
};
var detailRow = {
    marginBottom: "12px"
};
var detailLabel = {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "4px"
};
var detailValue = {
    fontSize: "15px",
    color: "#111827",
    fontWeight: "500"
};
var ctaSection = {
    padding: "32px",
    textAlign: "center"
};
var ctaButton = {
    backgroundColor: "#111827",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    display: "inline-block",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
};
var divider = {
    margin: "0",
    borderTop: "1px solid #f1f1f1"
};
var footer = {
    padding: "32px",
    textAlign: "center"
};
var footerText = {
    fontSize: "14px",
    color: "#6B7280",
    margin: "0 0 4px"
};
var footerHighlight = {
    fontSize: "14px",
    color: "#111827",
    fontWeight: "600",
    margin: "0"
};
exports["default"] = exports.PaymentInvoiceEmail;
