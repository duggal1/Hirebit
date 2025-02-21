"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var PRICING = {
    BASE_MONTHLY_PRICE: 49.99,
    TAX_RATE: 0.1,
    DURATIONS: {
        '6': {
            months: 6,
            price: 249.00,
            discount: 0.17 // (~17% off monthly price)
        },
        '3': {
            months: 3,
            price: 129.00,
            discount: 0.14 // (~14% off monthly price)
        },
        '1': {
            months: 1,
            price: 49.99,
            discount: 0 // No discount for single month
        }
    }
};
// Update the calculation function to use fixed prices
var calculateSubscriptionPrice = function (durationInMonths) {
    var durationKey = durationInMonths.toString();
    var duration = PRICING.DURATIONS[durationKey] || {
        months: 1,
        price: PRICING.BASE_MONTHLY_PRICE,
        discount: 0
    };
    var basePrice = duration.price;
    var taxes = basePrice * PRICING.TAX_RATE;
    var monthlyPrice = PRICING.BASE_MONTHLY_PRICE * duration.months;
    var savings = monthlyPrice - basePrice;
    return {
        basePrice: basePrice,
        taxes: taxes,
        total: basePrice + taxes,
        duration: duration.months,
        savings: savings > 0 ? savings : 0
    };
};
exports.sendPaymentInvoiceEmail = client_1.inngest.createFunction({
    id: "send-payment-invoice",
    name: "Send Payment Invoice Email",
    retries: 3
}, { event: "payment.succeeded" }, function (_a) {
    var event = _a.event, step = _a.step;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, jobId_1, paymentIntentId_1, amount, currency_1, jobData_1, paymentData_1, paymentDetails_1, emailResult, error_1;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 6, , 7]);
                    _b = event.data, jobId_1 = _b.jobId, paymentIntentId_1 = _b.paymentIntentId, amount = _b.amount, currency_1 = _b.currency;
                    return [4 /*yield*/, step.run("fetch-job-data", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var job;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db_1.prisma.jobPost.findUnique({
                                            where: { id: jobId_1 },
                                            include: {
                                                company: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        about: true,
                                                        location: true,
                                                        user: {
                                                            select: {
                                                                email: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })];
                                    case 1:
                                        job = _a.sent();
                                        if (!job) {
                                            throw new Error("Job not found: " + jobId_1);
                                        }
                                        return [2 /*return*/, __assign(__assign({}, job), { company: __assign(__assign({}, job.company), { location: job.company.location || {
                                                        country: 'US',
                                                        city: undefined,
                                                        state: undefined
                                                    } }) })];
                                }
                            });
                        }); })];
                case 1:
                    jobData_1 = _e.sent();
                    return [4 /*yield*/, step.run("fetch-payment-data", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var subscriptionDuration, pricing, paymentIntent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (paymentIntentId_1 === 'manual_creation') {
                                            subscriptionDuration = parseInt(event.data.subscriptionDuration || '6');
                                            pricing = calculateSubscriptionPrice(subscriptionDuration);
                                            return [2 /*return*/, {
                                                    id: "manual_" + Date.now(),
                                                    amount: Math.round(pricing.total * 100),
                                                    currency: currency_1 || 'usd',
                                                    created: Date.now() / 1000,
                                                    billing_details: {
                                                        address: {
                                                            country: jobData_1.company.location.country || 'US',
                                                            city: jobData_1.company.location.city,
                                                            state: jobData_1.company.location.state
                                                        },
                                                        email: jobData_1.company.user.email || '',
                                                        name: jobData_1.company.name || ''
                                                    },
                                                    metadata: {
                                                        tax_rate: PRICING.TAX_RATE.toString(),
                                                        subscription_duration: (subscriptionDuration * 30).toString(),
                                                        invoice_number: "INV-" + jobData_1.id + "-" + Date.now(),
                                                        job_post_id: jobData_1.id,
                                                        base_price: pricing.basePrice.toString(),
                                                        savings: pricing.savings.toString()
                                                    },
                                                    payment_method_details: {
                                                        type: 'manual',
                                                        card: null
                                                    },
                                                    receipt_url: process.env.NEXT_PUBLIC_APP_URL + "/invoices/download/" + jobData_1.id
                                                }];
                                        }
                                        return [4 /*yield*/, stripe_1.stripe.paymentIntents.retrieve(paymentIntentId_1, {
                                                expand: ['latest_charge', 'customer']
                                            })];
                                    case 1:
                                        paymentIntent = _a.sent();
                                        if (!paymentIntent.latest_charge) {
                                            throw new Error("No charge found for payment intent: " + paymentIntentId_1);
                                        }
                                        return [2 /*return*/, paymentIntent.latest_charge];
                                }
                            });
                        }); })];
                case 2:
                    paymentData_1 = _e.sent();
                    if (!paymentData_1) {
                        throw new Error('Failed to fetch payment data');
                    }
                    return [4 /*yield*/, step.run("process-payment-details", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var subscriptionDuration, pricing;
                            var _a, _b, _c, _d;
                            return __generator(this, function (_e) {
                                subscriptionDuration = parseInt(((_a = paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.metadata) === null || _a === void 0 ? void 0 : _a.subscription_duration) || '180') / 30;
                                pricing = calculateSubscriptionPrice(subscriptionDuration);
                                return [2 /*return*/, {
                                        basePrice: pricing.basePrice,
                                        taxes: pricing.taxes,
                                        total: pricing.total,
                                        currency: ((paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.currency) || 'usd').toUpperCase(),
                                        duration: pricing.duration,
                                        savings: pricing.savings,
                                        billingAddress: ((_b = paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.billing_details) === null || _b === void 0 ? void 0 : _b.address) || {
                                            country: 'US'
                                        },
                                        paymentMethod: {
                                            type: ((_c = paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.payment_method_details) === null || _c === void 0 ? void 0 : _c.type) || 'manual',
                                            details: (paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.payment_method_details) || { type: 'direct' }
                                        },
                                        invoiceNumber: ((_d = paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.metadata) === null || _d === void 0 ? void 0 : _d.invoice_number) || "INV-" + Date.now(),
                                        receiptUrl: (paymentData_1 === null || paymentData_1 === void 0 ? void 0 : paymentData_1.receipt_url) || process.env.NEXT_PUBLIC_APP_URL + "/invoices/" + jobId_1
                                    }];
                            });
                        }); })];
                case 3:
                    paymentDetails_1 = _e.sent();
                    return [4 /*yield*/, step.run("send-invoice-email", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var recipientEmail, startDate, endDate, planName, emailComponent;
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
                                        planName = paymentDetails_1.duration + " Month Job Posting" + (paymentDetails_1.duration > 1 ? 's' : '');
                                        emailComponent = email_template_1.PaymentInvoiceEmail({
                                            companyName: jobData_1.company.name,
                                            jobTitle: jobData_1.jobTitle,
                                            amount: paymentDetails_1.total + " " + paymentDetails_1.currency,
                                            paymentId: paymentData_1.id,
                                            paymentDate: date_fns_1.format(new Date(paymentData_1.created * 1000), "MMMM dd, yyyy"),
                                            expirationDate: date_fns_1.format(endDate, "MMMM dd, yyyy"),
                                            jobLocation: jobData_1.location,
                                            paymentStatus: "Completed",
                                            jobPostInfo: {
                                                id: jobData_1.id,
                                                status: jobData_1.status,
                                                createDate: date_fns_1.format(new Date(jobData_1.createdAt), "MMMM dd, yyyy"),
                                                activationDate: date_fns_1.format(new Date(jobData_1.activatedAt || Date.now()), "MMMM dd, yyyy")
                                            },
                                            paymentDetails: {
                                                basePrice: paymentDetails_1.basePrice + " " + paymentDetails_1.currency,
                                                taxes: paymentDetails_1.taxes + " " + paymentDetails_1.currency,
                                                total: paymentDetails_1.total + " " + paymentDetails_1.currency,
                                                savings: paymentDetails_1.savings + " " + paymentDetails_1.currency,
                                                duration: paymentDetails_1.duration + " months",
                                                invoiceNumber: paymentDetails_1.invoiceNumber,
                                                billingAddress: paymentDetails_1.billingAddress,
                                                paymentMethod: paymentDetails_1.paymentMethod,
                                                subscriptionInfo: {
                                                    planName: planName,
                                                    startDate: date_fns_1.format(startDate, "MMMM dd, yyyy"),
                                                    endDate: date_fns_1.format(endDate, "MMMM dd, yyyy"),
                                                    status: "ACTIVE"
                                                },
                                                receiptUrl: paymentDetails_1.receiptUrl
                                            }
                                        });
                                        return [4 /*yield*/, resend.emails.send({
                                                from: RESEND_FROM_EMAIL,
                                                to: [recipientEmail],
                                                subject: "Job Posting Confirmation: " + jobData_1.jobTitle,
                                                react: emailComponent
                                            })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 4:
                    emailResult = _e.sent();
                    // Update job post section
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId_1 },
                            data: {
                                status: "ACTIVE",
                                invoiceEmailId: (_c = emailResult.data) === null || _c === void 0 ? void 0 : _c.id,
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
                    // Update job post section
                    _e.sent();
                    return [2 /*return*/, {
                            success: true,
                            jobId: jobId_1,
                            emailId: (_d = emailResult.data) === null || _d === void 0 ? void 0 : _d.id,
                            paymentId: paymentData_1.id,
                            paymentDetails: paymentDetails_1
                        }];
                case 6:
                    error_1 = _e.sent();
                    console.error("[Inngest] Email failed:", error_1);
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
});
