"use strict";
exports.__esModule = true;
exports.PaymentInvoiceEmail = void 0;
var components_1 = require("@react-email/components");
var React = require("react");
exports.PaymentInvoiceEmail = function (_a) {
    var companyName = _a.companyName, jobTitle = _a.jobTitle, amount = _a.amount, paymentId = _a.paymentId, paymentDetails = _a.paymentDetails, paymentDate = _a.paymentDate, expirationDate = _a.expirationDate, jobLocation = _a.jobLocation, paymentStatus = _a.paymentStatus, jobPostInfo = _a.jobPostInfo;
    var toStyleObject = function (style) {
        return style;
    };
    var formatCurrency = function (amount) {
        var _a = amount.split(" "), value = _a[0], currency = _a[1];
        return currency + " " + parseFloat(value).toFixed(2);
    };
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null,
            React.createElement("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
            React.createElement("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" }),
            React.createElement("link", { href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap", rel: "stylesheet" })),
        React.createElement(components_1.Preview, null,
            "Payment Confirmation for ",
            jobTitle),
        React.createElement(components_1.Body, { style: main },
            React.createElement(components_1.Container, { style: container },
                React.createElement(components_1.Section, { style: header },
                    React.createElement(components_1.Img, { src: process.env.NEXT_PUBLIC_APP_URL + "/images/logo.png", width: 180, height: 140, alt: "Hirebit", style: logoStyle })),
                React.createElement(components_1.Section, { style: content },
                    React.createElement(components_1.Section, { style: heroSection },
                        React.createElement(components_1.Text, { style: toStyleObject(statusWrapper) },
                            React.createElement(components_1.Text, { style: toStyleObject(status) }, paymentStatus)),
                        React.createElement(components_1.Text, { style: toStyleObject(amount) }, formatCurrency(paymentDetails.total)),
                        React.createElement(components_1.Text, { style: toStyleObject(confirmationText) }, "Payment Successfully Processed")),
                    React.createElement(components_1.Section, { style: summarySection },
                        React.createElement(components_1.Text, { style: summaryAmount }, formatCurrency(paymentDetails.total)),
                        React.createElement(components_1.Text, { style: summaryLabel }, "Total Amount"),
                        React.createElement(components_1.Section, { style: summaryDetails },
                            React.createElement(components_1.Text, { style: summaryItem },
                                "Base: ",
                                formatCurrency(paymentDetails.basePrice)),
                            React.createElement(components_1.Text, { style: summaryDivider }, "\u2022"),
                            React.createElement(components_1.Text, { style: summaryItem },
                                "Tax: ",
                                formatCurrency(paymentDetails.taxes)))),
                    React.createElement(components_1.Section, { style: infoGrid },
                        React.createElement(components_1.Section, { style: infoCard },
                            React.createElement(components_1.Text, { style: cardLabel }, "Payment Information"),
                            React.createElement(components_1.Section, { style: cardContent },
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Invoice Number"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.invoiceNumber)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Payment ID"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentId)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Payment Date"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDate)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Duration"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.duration)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Method"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.paymentMethod.type.toUpperCase())))),
                        React.createElement(components_1.Section, { style: infoCard },
                            React.createElement(components_1.Text, { style: cardLabel }, "Job Post Details"),
                            React.createElement(components_1.Section, { style: cardContent },
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Job ID"),
                                    React.createElement(components_1.Text, { style: detailValue }, jobPostInfo.id)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Title"),
                                    React.createElement(components_1.Text, { style: detailValue }, jobTitle)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Location"),
                                    React.createElement(components_1.Text, { style: detailValue }, jobLocation)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Status"),
                                    React.createElement(components_1.Text, { style: detailValue }, jobPostInfo.status)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Created"),
                                    React.createElement(components_1.Text, { style: detailValue }, jobPostInfo.createDate)))),
                        React.createElement(components_1.Section, { style: infoCard },
                            React.createElement(components_1.Text, { style: cardLabel }, "Subscription Info"),
                            React.createElement(components_1.Section, { style: cardContent },
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Plan"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.subscriptionInfo.planName)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Start Date"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.subscriptionInfo.startDate)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "End Date"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.subscriptionInfo.endDate)),
                                React.createElement(components_1.Section, { style: detailRow },
                                    React.createElement(components_1.Text, { style: detailLabel }, "Status"),
                                    React.createElement(components_1.Text, { style: detailValue }, paymentDetails.subscriptionInfo.status))))),
                    React.createElement(components_1.Section, { style: ctaSection },
                        React.createElement(components_1.Link, { href: paymentDetails.receiptUrl, style: ctaButton }, "Download Invoice"),
                        React.createElement(components_1.Link, { href: process.env.NEXT_PUBLIC_APP_URL + "/jobs/" + jobPostInfo.id, style: secondaryButton }, "View Job Post"))),
                React.createElement(components_1.Section, { style: footer },
                    React.createElement(components_1.Text, { style: footerText },
                        "Job posting active until ",
                        React.createElement("span", { style: footerHighlight }, expirationDate)))))));
};
var main = {
    backgroundColor: "#F4F7FF",
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "48px 0"
};
var container = {
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.04)"
};
var header = {
    padding: "40px",
    backgroundColor: "#ffffff",
    textAlign: "center",
    borderBottom: "1px solid rgba(0, 0, 0, 0.04)"
};
var logoStyle = {
    margin: "0 auto"
};
var content = {
    padding: "0"
};
var heroSection = {
    background: "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)",
    padding: "56px 40px",
    textAlign: "center"
};
var statusWrapper = {
    marginBottom: "24px"
};
var status = {
    fontSize: "13px",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: "600",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    padding: "8px 16px",
    borderRadius: "100px",
    display: "inline-block"
};
var amount = {
    fontSize: "56px",
    lineHeight: "1",
    fontWeight: "700",
    color: "#1E293B",
    margin: "0 0 16px",
    letterSpacing: "-0.03em"
};
var confirmationText = {
    fontSize: "16px",
    color: "#64748B",
    margin: "0",
    fontWeight: "500"
};
var summarySection = {
    padding: "40px",
    textAlign: "center",
    borderBottom: "1px solid rgba(0, 0, 0, 0.04)"
};
var summaryAmount = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1E293B",
    margin: "0 0 8px",
    letterSpacing: "-0.02em"
};
var summaryLabel = {
    fontSize: "14px",
    color: "#64748B",
    marginBottom: "16px",
    fontWeight: "500"
};
var summaryDetails = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px"
};
var summaryItem = {
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "500"
};
var summaryDivider = {
    color: "#CBD5E1"
};
var infoGrid = {
    padding: "40px",
    display: "grid",
    gap: "24px"
};
var infoCard = {
    backgroundColor: "#F8FAFF",
    borderRadius: "16px",
    padding: "24px"
};
var cardLabel = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1E293B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "20px"
};
var cardContent = {
    display: "grid",
    gap: "16px"
};
var detailRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
};
var detailLabel = {
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "500"
};
var detailValue = {
    fontSize: "14px",
    color: "#1E293B",
    fontWeight: "600"
};
var addressText = {
    fontSize: "14px",
    color: "#1E293B",
    lineHeight: "1.6",
    margin: "0"
};
var ctaSection = {
    padding: "40px",
    textAlign: "center",
    display: "grid",
    gap: "16px"
};
var ctaButton = {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    textTransform: "none",
    letterSpacing: "0"
};
var secondaryButton = {
    backgroundColor: "#F1F5F9",
    color: "#1E293B",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block"
};
var footer = {
    padding: "32px 40px",
    backgroundColor: "#F8FAFF",
    textAlign: "center"
};
var footerText = {
    fontSize: "14px",
    color: "#64748B",
    margin: "0",
    fontWeight: "500"
};
var footerHighlight = {
    color: "#1E293B",
    fontWeight: "600"
};
exports["default"] = exports.PaymentInvoiceEmail;
