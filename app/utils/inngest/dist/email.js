"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.sendPaymentInvoiceEmail = void 0;
var date_fns_1 = require("date-fns");
var resend_1 = require("resend");
var client_1 = require("./client");
var stripe_1 = require("../stripe");
var db_1 = require("../db");
var email_template_1 = require("@/components/email/inngest/email-template");
if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
}
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
var RESEND_FROM_EMAIL = "Hirebit <invoices@" + (process.env.RESEND_DOMAIN || "hirebit.site") + ">";
exports.sendPaymentInvoiceEmail = client_1.inngest.createFunction({
    id: "send-payment-invoice",
    name: "Send Payment Invoice Email",
    retries: 3
}, { event: "payment.succeeded" }, function (_a) {
    var event = _a.event, step = _a.step;
    return __awaiter(void 0, void 0, void 0, function () {
        var jobId_1, paymentData_1, jobData_1, paymentDetails_1, emailResult, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 6, , 7]);
                    jobId_1 = event.data.jobId;
                    return [4 /*yield*/, step.run("fetch-payment-data", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var paymentIntent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, stripe_1.stripe.paymentIntents.retrieve(event.data.paymentIntentId, {
                                            expand: ['latest_charge', 'customer', 'payment_method']
                                        })];
                                    case 1:
                                        paymentIntent = _a.sent();
                                        return [2 /*return*/, paymentIntent.latest_charge];
                                }
                            });
                        }); })];
                case 1:
                    paymentData_1 = _d.sent();
                    return [4 /*yield*/, step.run("fetch-job-details", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var job;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db_1.prisma.jobPost.findUnique({
                                            where: { id: jobId_1 },
                                            include: {
                                                company: {
                                                    include: {
                                                        user: true
                                                    }
                                                }
                                            }
                                        })];
                                    case 1:
                                        job = _a.sent();
                                        if (!job)
                                            throw new Error("Job not found: " + jobId_1);
                                        return [2 /*return*/, job];
                                }
                            });
                        }); })];
                case 2:
                    jobData_1 = _d.sent();
                    return [4 /*yield*/, step.run("process-payment-details", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var basePrice, taxRate, taxes, total, duration;
                            return __generator(this, function (_a) {
                                basePrice = paymentData_1.amount / 100;
                                taxRate = parseFloat(paymentData_1.metadata.tax_rate || "0.1");
                                taxes = basePrice * taxRate;
                                total = basePrice + taxes;
                                duration = parseInt(paymentData_1.metadata.subscription_duration || "180");
                                return [2 /*return*/, {
                                        basePrice: basePrice,
                                        taxes: taxes,
                                        total: total,
                                        currency: paymentData_1.currency.toUpperCase(),
                                        duration: Math.floor(duration / 30),
                                        billingAddress: paymentData_1.billing_details.address,
                                        paymentMethod: {
                                            type: paymentData_1.payment_method_details.type,
                                            details: paymentData_1.payment_method_details
                                        },
                                        invoiceNumber: paymentData_1.metadata.invoice_number || "INV-" + Date.now(),
                                        receiptUrl: paymentData_1.receipt_url
                                    }];
                            });
                        }); })];
                case 3:
                    paymentDetails_1 = _d.sent();
                    return [4 /*yield*/, step.run("send-invoice-email", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var recipientEmail, startDate, endDate, emailComponent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        recipientEmail = jobData_1.company.user.email;
                                        if (!recipientEmail) {
                                            throw new Error("No email found for company: " + jobData_1.company.id);
                                        }
                                        startDate = new Date(paymentData_1.created * 1000);
                                        endDate = new Date(startDate);
                                        endDate.setDate(startDate.getDate() + (paymentDetails_1.duration * 30));
                                        emailComponent = email_template_1.PaymentInvoiceEmail({
                                            companyName: jobData_1.company.name,
                                            jobTitle: jobData_1.jobTitle,
                                            amount: paymentDetails_1.currency + " " + paymentDetails_1.total.toFixed(2),
                                            paymentId: paymentData_1.id,
                                            paymentDate: date_fns_1.format(startDate, "MMMM dd, yyyy"),
                                            expirationDate: date_fns_1.format(endDate, "MMMM dd, yyyy"),
                                            jobLocation: jobData_1.location,
                                            paymentStatus: "Completed",
                                            paymentDetails: {
                                                basePrice: paymentDetails_1.currency + " " + paymentDetails_1.basePrice.toFixed(2),
                                                taxes: paymentDetails_1.currency + " " + paymentDetails_1.taxes.toFixed(2),
                                                total: paymentDetails_1.currency + " " + paymentDetails_1.total.toFixed(2),
                                                duration: paymentDetails_1.duration + " months",
                                                invoiceNumber: paymentDetails_1.invoiceNumber,
                                                billingAddress: paymentDetails_1.billingAddress,
                                                paymentMethod: paymentDetails_1.paymentMethod,
                                                receiptUrl: paymentDetails_1.receiptUrl
                                            }
                                        });
                                        return [4 /*yield*/, resend.emails.send({
                                                from: RESEND_FROM_EMAIL,
                                                to: [jobData_1.company.user.email],
                                                subject: "Job Posting Confirmation: " + jobData_1.jobTitle,
                                                react: emailComponent
                                            })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 4:
                    emailResult = _d.sent();
                    // Update job with comprehensive payment details
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId_1 },
                            data: {
                                status: "ACTIVE",
                                invoiceEmailId: (_b = emailResult.data) === null || _b === void 0 ? void 0 : _b.id,
                                invoiceEmailSentAt: new Date(),
                                subscriptionStartDate: new Date(paymentData_1.created * 1000),
                                subscriptionEndDate: new Date(paymentData_1.created * 1000 + (paymentDetails_1.duration * 30 * 24 * 60 * 60 * 1000)),
                                paymentDetails: {
                                    stripePaymentId: paymentData_1.id,
                                    amount: paymentDetails_1.total,
                                    basePrice: paymentDetails_1.basePrice,
                                    taxes: paymentDetails_1.taxes,
                                    currency: paymentDetails_1.currency,
                                    duration: paymentDetails_1.duration,
                                    invoiceNumber: paymentDetails_1.invoiceNumber,
                                    billingAddress: paymentDetails_1.billingAddress,
                                    paymentMethod: paymentDetails_1.paymentMethod,
                                    receiptUrl: paymentDetails_1.receiptUrl,
                                    metadata: paymentData_1.metadata
                                }
                            }
                        })];
                case 5:
                    // Update job with comprehensive payment details
                    _d.sent();
                    return [2 /*return*/, {
                            success: true,
                            jobId: jobId_1,
                            emailId: (_c = emailResult.data) === null || _c === void 0 ? void 0 : _c.id,
                            paymentId: paymentData_1.id,
                            paymentDetails: paymentDetails_1
                        }];
                case 6:
                    error_1 = _d.sent();
                    console.error("[Inngest] Email failed:", error_1);
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
});
