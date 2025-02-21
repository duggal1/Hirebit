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
exports.OPTIONS = exports.POST = void 0;
var db_1 = require("@/app/utils/db");
var stripe_1 = require("@/app/utils/stripe");
var headers_1 = require("next/headers");
var cache_1 = require("next/cache");
var client_1 = require("@/app/utils/inngest/client");
function POST(req) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var body, signature, event, _d, paymentIntent, jobId, updatedJob, inngestResponse, response, error_1, failedPayment, failedJobId, processingPayment, processingJobId, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 17, , 18]);
                    return [4 /*yield*/, req.text()];
                case 1:
                    body = _e.sent();
                    return [4 /*yield*/, headers_1.headers()];
                case 2:
                    signature = (_e.sent()).get("Stripe-Signature");
                    if (!signature) {
                        console.error("[Webhook] No Stripe signature found");
                        return [2 /*return*/, new Response(JSON.stringify({ success: false, error: "No Stripe signature" }), { status: 400 })];
                    }
                    if (!process.env.STRIPE_WEBHOOK_SECRET) {
                        console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
                        return [2 /*return*/, new Response(JSON.stringify({ success: false, error: "Webhook secret not configured" }), { status: 500 })];
                    }
                    event = void 0;
                    try {
                        event = stripe_1.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
                        console.log("[Webhook] Received event:", event.type);
                    }
                    catch (err) {
                        console.error("[Webhook] Signature verification failed:", err);
                        return [2 /*return*/, new Response(JSON.stringify({ success: false, error: "Invalid signature" }), { status: 400 })];
                    }
                    _d = event.type;
                    switch (_d) {
                        case "payment_intent.succeeded": return [3 /*break*/, 3];
                        case "payment_intent.payment_failed": return [3 /*break*/, 9];
                        case "payment_intent.processing": return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 15];
                case 3:
                    paymentIntent = event.data.object;
                    jobId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.jobId;
                    if (!jobId) {
                        console.error("[Webhook] No jobId in metadata:", paymentIntent.id);
                        return [2 /*return*/, new Response(JSON.stringify({ success: false, error: "No job ID found" }), { status: 400 })];
                    }
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 8, , 9]);
                    console.log("[Webhook] Processing payment success:", {
                        paymentIntentId: paymentIntent.id,
                        jobId: jobId,
                        amount: paymentIntent.amount
                    });
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId },
                            data: {
                                status: "ACTIVE",
                                paidAt: new Date(),
                                paymentId: paymentIntent.id,
                                paymentStatus: "COMPLETED",
                                paymentAmount: paymentIntent.amount
                            }
                        })];
                case 5:
                    updatedJob = _e.sent();
                    console.log("[Webhook] Job updated:", updatedJob);
                    return [4 /*yield*/, client_1.inngest.send({
                            name: "payment.succeeded",
                            data: {
                                paymentIntentId: paymentIntent.id,
                                jobId: jobId,
                                amount: paymentIntent.amount,
                                currency: paymentIntent.currency,
                                status: paymentIntent.status,
                                created: paymentIntent.created
                            }
                        })];
                case 6:
                    inngestResponse = _e.sent();
                    console.log("[Webhook] Inngest event sent:", inngestResponse);
                    // Ensure event processing
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 7:
                    // Ensure event processing
                    _e.sent();
                    // Revalidate cached pages
                    cache_1.revalidatePath('/');
                    cache_1.revalidatePath('/my-jobs');
                    cache_1.revalidatePath("/job/" + jobId);
                    response = {
                        success: true,
                        jobId: jobId,
                        status: "ACTIVE"
                    };
                    return [2 /*return*/, new Response(JSON.stringify(response), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        })];
                case 8:
                    error_1 = _e.sent();
                    console.error("[Webhook] Payment processing error:", error_1);
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : "Payment processing failed"
                        }), { status: 500 })];
                case 9:
                    failedPayment = event.data.object;
                    failedJobId = (_b = failedPayment.metadata) === null || _b === void 0 ? void 0 : _b.jobId;
                    if (!failedJobId) return [3 /*break*/, 11];
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: failedJobId },
                            data: {
                                status: "DRAFT",
                                paymentStatus: "FAILED",
                                paymentId: failedPayment.id
                            }
                        })];
                case 10:
                    _e.sent();
                    console.log("[Webhook] Payment failed for job:", failedJobId);
                    _e.label = 11;
                case 11: return [3 /*break*/, 16];
                case 12:
                    processingPayment = event.data.object;
                    processingJobId = (_c = processingPayment.metadata) === null || _c === void 0 ? void 0 : _c.jobId;
                    if (!processingJobId) return [3 /*break*/, 14];
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: processingJobId },
                            data: {
                                status: "DRAFT",
                                paymentStatus: "PROCESSING",
                                paymentId: processingPayment.id
                            }
                        })];
                case 13:
                    _e.sent();
                    console.log("[Webhook] Payment processing for job:", processingJobId);
                    _e.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    {
                        console.log("[Webhook] Unhandled event type:", event.type);
                    }
                    _e.label = 16;
                case 16: return [2 /*return*/, new Response(JSON.stringify({ success: true }), { status: 200 })];
                case 17:
                    error_2 = _e.sent();
                    console.error("[Webhook] Unhandled error:", error_2);
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: false,
                            error: "Internal server error"
                        }), { status: 500 })];
                case 18: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
function OPTIONS() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Response(null, {
                    headers: {
                        'Allow': 'POST',
                        'Access-Control-Allow-Methods': 'POST',
                        'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature'
                    }
                })];
        });
    });
}
exports.OPTIONS = OPTIONS;
