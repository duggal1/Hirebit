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
var server_1 = require("next/server");
var cache_1 = require("next/cache");
var client_1 = require("@/app/utils/inngest/client");
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var body, signature, event, paymentIntent, jobId, updatedJob, error_1, paymentIntent, jobId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, req.text()];
                case 1:
                    body = _a.sent();
                    return [4 /*yield*/, headers_1.headers()];
                case 2:
                    signature = (_a.sent()).get("Stripe-Signature");
                    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
                        console.error("[Payment Webhook] Missing signature or secret");
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: "Configuration error" }, { status: 400 })];
                    }
                    event = stripe_1.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
                    console.log("[Payment Webhook] Event received:", event.type);
                    if (!(event.type === "payment_intent.succeeded")) return [3 /*break*/, 7];
                    paymentIntent = event.data.object;
                    jobId = (paymentIntent.metadata || {}).jobId;
                    if (!jobId) {
                        console.error("[Payment Webhook] No jobId in metadata");
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: "No job ID found" }, { status: 400 })];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId },
                            data: {
                                status: "ACTIVE",
                                paidAt: new Date(),
                                paymentId: paymentIntent.id,
                                paymentStatus: "COMPLETED",
                                paymentAmount: paymentIntent.amount,
                                invoiceData: {
                                    paymentId: paymentIntent.id,
                                    amount: paymentIntent.amount,
                                    currency: paymentIntent.currency,
                                    paidAt: new Date().toISOString(),
                                    receipt_url: "https://dashboard.stripe.com/payments/" + paymentIntent.id
                                }
                            }
                        })];
                case 4:
                    updatedJob = _a.sent();
                    console.log("[Payment Webhook] Job activated:", {
                        jobId: jobId,
                        paymentId: paymentIntent.id,
                        status: "ACTIVE"
                    });
                    // 2. Trigger Inngest event for email
                    return [4 /*yield*/, client_1.inngest.send({
                            name: "payment.succeeded",
                            data: {
                                paymentIntentId: paymentIntent.id,
                                jobId: jobId,
                                amount: paymentIntent.amount,
                                currency: paymentIntent.currency
                            }
                        })];
                case 5:
                    // 2. Trigger Inngest event for email
                    _a.sent();
                    // 3. Revalidate pages
                    cache_1.revalidatePath('/');
                    cache_1.revalidatePath('/my-jobs');
                    cache_1.revalidatePath("/job/" + jobId);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            jobId: jobId,
                            status: "ACTIVE",
                            paymentId: paymentIntent.id
                        })];
                case 6:
                    error_1 = _a.sent();
                    console.error("[Payment Webhook] Processing error:", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 })];
                case 7:
                    if (!(event.type === "payment_intent.payment_failed")) return [3 /*break*/, 9];
                    paymentIntent = event.data.object;
                    jobId = (paymentIntent.metadata || {}).jobId;
                    if (!jobId) return [3 /*break*/, 9];
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId },
                            data: {
                                status: "DRAFT",
                                paymentStatus: "FAILED",
                                paymentId: paymentIntent.id
                            }
                        })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 10:
                    error_2 = _a.sent();
                    console.error("[Payment Webhook] Error:", error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 400 })];
                case 11: return [2 /*return*/];
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
