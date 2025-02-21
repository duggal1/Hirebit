"use strict";
exports.__esModule = true;
exports.PaymentInvoiceEmail = void 0;
var components_1 = require("@react-email/components");
var React = require("react");
exports.PaymentInvoiceEmail = function (_a) {
    var companyName = _a.companyName, jobTitle = _a.jobTitle, amount = _a.amount, paymentId = _a.paymentId, paymentDate = _a.paymentDate, expirationDate = _a.expirationDate, jobDuration = _a.jobDuration, jobLocation = _a.jobLocation, paymentStatus = _a.paymentStatus;
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null, "Payment Invoice for Your Job Posting on Hirebit"),
        React.createElement(components_1.Body, { style: main },
            React.createElement(components_1.Container, { style: container },
                React.createElement(components_1.Section, { style: header },
                    React.createElement(components_1.Img, { src: process.env.NEXT_PUBLIC_APP_URL + "/logo.png", width: "140", height: "40", alt: "Hirebit" })),
                React.createElement(components_1.Section, { style: content },
                    React.createElement(components_1.Text, { style: title }, "Payment Invoice"),
                    React.createElement(components_1.Text, { style: subtitle }, "Thank you for posting a job on Hirebit!"),
                    React.createElement(components_1.Section, { style: detailsContainer },
                        React.createElement(components_1.Row, null,
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Company"),
                                React.createElement(components_1.Text, { style: valueText }, companyName)),
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Amount Paid"),
                                React.createElement(components_1.Text, { style: valueText }, amount))),
                        React.createElement(components_1.Hr, { style: divider }),
                        React.createElement(components_1.Row, null,
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Job Title"),
                                React.createElement(components_1.Text, { style: valueText }, jobTitle)),
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Location"),
                                React.createElement(components_1.Text, { style: valueText }, jobLocation))),
                        React.createElement(components_1.Hr, { style: divider }),
                        React.createElement(components_1.Row, null,
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Payment Date"),
                                React.createElement(components_1.Text, { style: valueText }, paymentDate)),
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Payment Status"),
                                React.createElement(components_1.Text, { style: valueText }, paymentStatus))),
                        React.createElement(components_1.Hr, { style: divider }),
                        React.createElement(components_1.Row, null,
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Duration"),
                                React.createElement(components_1.Text, { style: valueText }, jobDuration)),
                            React.createElement(components_1.Column, null,
                                React.createElement(components_1.Text, { style: labelText }, "Expiration Date"),
                                React.createElement(components_1.Text, { style: valueText }, expirationDate))),
                        React.createElement(components_1.Hr, { style: divider }),
                        React.createElement(components_1.Text, { style: labelText }, "Payment ID"),
                        React.createElement(components_1.Text, { style: valueText }, paymentId)),
                    React.createElement(components_1.Text, { style: footerText },
                        "Your job posting will be active until ",
                        expirationDate,
                        ". You'll receive a notification before the expiration date."))))));
};
exports["default"] = exports.PaymentInvoiceEmail;
// Styles
var main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
};
var container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    borderRadius: "12px",
    maxWidth: "600px"
};
var header = {
    padding: "32px 48px 0"
};
var content = {
    padding: "0 48px"
};
var title = {
    fontSize: "32px",
    fontWeight: "600",
    color: "#000",
    marginBottom: "4px"
};
var subtitle = {
    fontSize: "16px",
    color: "#666",
    marginTop: "0",
    marginBottom: "24px"
};
var detailsContainer = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px"
};
var labelText = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px"
};
var valueText = {
    fontSize: "16px",
    color: "#000",
    fontWeight: "500",
    marginTop: "0",
    marginBottom: "16px"
};
var divider = {
    borderTop: "1px solid #e6e6e6",
    margin: "16px 0"
};
var footerText = {
    fontSize: "14px",
    color: "#666",
    marginTop: "32px",
    fontStyle: "italic"
};
