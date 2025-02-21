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
        var jobId_1, paymentIntentId_1, jobData_1, startDate, expirationDate_1, emailResult, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("[Inngest] Starting with data:", event.data);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    jobId_1 = event.data.jobId;
                    paymentIntentId_1 = event.data.paymentIntentId || "manual_creation";
                    if (!jobId_1) {
                        throw new Error("Missing required jobId");
                    }
                    return [4 /*yield*/, step.run("fetch-job-details", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var job;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
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
                                        job = _c.sent();
                                        if (!((_b = (_a = job === null || job === void 0 ? void 0 : job.company) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.email)) {
                                            throw new Error("Invalid job data for jobId: " + jobId_1);
                                        }
                                        return [2 /*return*/, job];
                                }
                            });
                        }); })];
                case 2:
                    jobData_1 = _b.sent();
                    startDate = new Date();
                    expirationDate_1 = new Date(startDate);
                    expirationDate_1.setDate(startDate.getDate() + (jobData_1.listingDuration || 30));
                    return [4 /*yield*/, step.run("send-invoice-email", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var recipientEmail, emailComponent, response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        recipientEmail = jobData_1.company.user.email;
                                        if (!recipientEmail) {
                                            throw new Error("Invalid recipient email for company: " + jobData_1.company.id);
                                        }
                                        emailComponent = email_template_1.PaymentInvoiceEmail({
                                            companyName: jobData_1.company.name,
                                            jobTitle: jobData_1.jobTitle,
                                            amount: "$" + (jobData_1.paymentAmount || jobData_1.salaryFrom / 100).toFixed(2),
                                            paymentId: paymentIntentId_1,
                                            paymentDate: date_fns_1.format(new Date(), "MMMM dd, yyyy"),
                                            expirationDate: date_fns_1.format(expirationDate_1, "MMMM dd, yyyy"),
                                            jobDuration: jobData_1.listingDuration + " days",
                                            jobLocation: jobData_1.location,
                                            paymentStatus: "Completed",
                                            companyDescription: jobData_1.company.about,
                                            jobDescription: jobData_1.jobDescription,
                                            benefits: jobData_1.benefits,
                                            skillsRequired: jobData_1.skillsRequired,
                                            salary: {
                                                from: jobData_1.salaryFrom,
                                                to: jobData_1.salaryTo
                                            },
                                            recipientEmail: recipientEmail,
                                            companyId: jobData_1.company.id
                                        });
                                        return [4 /*yield*/, resend.emails.send({
                                                from: RESEND_FROM_EMAIL,
                                                to: [recipientEmail],
                                                subject: "Job Posting Confirmation: " + jobData_1.jobTitle,
                                                react: emailComponent
                                            })];
                                    case 1:
                                        response = _a.sent();
                                        return [2 /*return*/, response];
                                }
                            });
                        }); })];
                case 3:
                    emailResult = _b.sent();
                    // Update job with email data
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId_1 },
                            data: {
                                status: "ACTIVE",
                                invoiceEmailId: emailResult.id,
                                invoiceEmailSentAt: new Date(),
                                invoiceData: {
                                    emailId: emailResult.id,
                                    sentAt: new Date().toISOString(),
                                    amount: jobData_1.salaryFrom,
                                    expirationDate: expirationDate_1.toISOString(),
                                    paymentMethod: "Direct Creation",
                                    receiptUrl: process.env.NEXT_PUBLIC_APP_URL + "/job/" + jobId_1
                                }
                            }
                        })];
                case 4:
                    // Update job with email data
                    _b.sent();
                    return [2 /*return*/, {
                            success: true,
                            jobId: jobId_1,
                            emailId: emailResult.id,
                            sentAt: new Date().toISOString()
                        }];
                case 5:
                    error_1 = _b.sent();
                    console.error("[Inngest] Email failed:", error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
});
