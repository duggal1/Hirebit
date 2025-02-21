"use strict";
exports.__esModule = true;
exports.PaymentInvoiceEmail = void 0;
var components_1 = require("@react-email/components");
var React = require("react");
exports.PaymentInvoiceEmail = function (_a) {
    var companyName = _a.companyName, jobTitle = _a.jobTitle, amount = _a.amount, paymentId = _a.paymentId, paymentDate = _a.paymentDate, expirationDate = _a.expirationDate, jobLocation = _a.jobLocation, paymentStatus = _a.paymentStatus;
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null,
            "Payment Confirmation for ",
            jobTitle),
        React.createElement(components_1.Body, { style: main },
            React.createElement(components_1.Container, { style: container },
                React.createElement(components_1.Section, { style: header },
                    React.createElement(components_1.Img, { src: "/logo.png", width: 120, height: 40, alt: "Hirebit", style: logoStyle })),
                React.createElement(components_1.Section, { style: content },
                    React.createElement(components_1.Text, { style: title }, "Payment Confirmation"),
                    React.createElement(components_1.Text, { style: subtitle }, "Thank you for your payment"),
                    React.createElement(components_1.Section, { style: infoBox },
                        React.createElement(components_1.Section, { style: infoItem },
                            React.createElement(components_1.Text, { style: label }, "Company"),
                            React.createElement(components_1.Text, { style: value }, companyName)),
                        React.createElement(components_1.Section, { style: infoItem },
                            React.createElement(components_1.Text, { style: label }, "Position"),
                            React.createElement(components_1.Text, { style: value }, jobTitle)),
                        React.createElement(components_1.Section, { style: infoItem },
                            React.createElement(components_1.Text, { style: label }, "Location"),
                            React.createElement(components_1.Text, { style: value }, jobLocation))),
                    React.createElement(components_1.Section, { style: paymentBox },
                        React.createElement(components_1.Text, { style: amount }, amount),
                        React.createElement(components_1.Text, { style: status }, paymentStatus),
                        React.createElement(components_1.Section, { style: paymentDetails },
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Payment ID"),
                                React.createElement(components_1.Text, { style: detailValue }, paymentId)),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Payment Date"),
                                React.createElement(components_1.Text, { style: detailValue }, paymentDate)),
                            React.createElement(components_1.Section, { style: detailRow },
                                React.createElement(components_1.Text, { style: detailLabel }, "Expiration Date"),
                                React.createElement(components_1.Text, { style: detailValue }, expirationDate))))),
                React.createElement(components_1.Hr, { style: divider }),
                React.createElement(components_1.Text, { style: footer },
                    "Your job posting will be active until ",
                    expirationDate)))));
};
// Style definitions with proper typing
var main = {
    backgroundColor: "#f6f9fc",
    padding: "30px 0"
};
var container = {
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
};
var header = {
    padding: "20px",
    backgroundColor: "#f8fafc",
    textAlign: "center"
};
var logoStyle = {
    margin: "0 auto"
};
var content = {
    padding: "32px 24px"
};
var title = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    margin: "0 0 8px"
};
var subtitle = {
    fontSize: "16px",
    color: "#666666",
    textAlign: "center",
    margin: "0 0 32px"
};
var infoBox = {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px"
};
var infoItem = {
    marginBottom: "12px"
};
var label = {
    fontSize: "14px",
    color: "#666666",
    marginBottom: "4px"
};
var value = {
    fontSize: "16px",
    color: "#1a1a1a",
    fontWeight: "500"
};
var paymentBox = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "24px"
};
var amount = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    margin: "0 0 8px"
};
var status = {
    fontSize: "14px",
    color: "#10b981",
    textAlign: "center",
    textTransform: "uppercase",
    margin: "0 0 24px"
};
var paymentDetails = {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "16px"
};
var detailRow = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
};
var detailLabel = {
    fontSize: "14px",
    color: "#666666"
};
var detailValue = {
    fontSize: "14px",
    color: "#1a1a1a",
    fontWeight: "500"
};
var divider = {
    margin: "32px 0",
    borderTop: "1px solid #e5e7eb"
};
var footer = {
    fontSize: "14px",
    color: "#666666",
    textAlign: "center",
    padding: "0 24px 32px"
};
exports["default"] = exports.PaymentInvoiceEmail;
