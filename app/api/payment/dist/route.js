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
var stripe_1 = require("@/app/utils/stripe");
var server_1 = require("next/server");
var zod_1 = require("zod");
var PRICE_MAPPING = {
    'price_1QuYsyRw85cV5wwQ5dPUcH75': 4900,
    'price_1QuYqlRw85cV5wwQsiwP2aFK': 12900,
    'price_1QuYs7Rw85cV5wwQZfNT5mIg': 24900
};
// Request validation schema
var paymentRequestSchema = zod_1.z.object({
    priceId: zod_1.z.string().min(1),
    jobId: zod_1.z.string().uuid()
});
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var body, result, _a, priceId, jobId, amount, paymentIntent, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, req.json()];
                case 1:
                    body = _b.sent();
                    result = paymentRequestSchema.safeParse(body);
                    if (!result.success) {
                        console.error('Validation error:', result.error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: result.error.errors }, { status: 400 })];
                    }
                    _a = result.data, priceId = _a.priceId, jobId = _a.jobId;
                    // Validate price ID exists in mapping
                    if (!(priceId in PRICE_MAPPING)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid price ID: " + priceId }, { status: 400 })];
                    }
                    amount = PRICE_MAPPING[priceId];
                    console.log('Creating payment intent:', { priceId: priceId, jobId: jobId, amount: amount });
                    return [4 /*yield*/, stripe_1.stripe.paymentIntents.create({
                            amount: amount,
                            currency: 'usd',
                            metadata: {
                                priceId: priceId,
                                jobId: jobId,
                                environment: process.env.NODE_ENV,
                                timestamp: new Date().toISOString()
                            },
                            automatic_payment_methods: {
                                enabled: true
                            }
                        })];
                case 2:
                    paymentIntent = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            clientSecret: paymentIntent.client_secret,
                            amount: paymentIntent.amount,
                            confirmParams: {
                                return_url: process.env.NEXT_PUBLIC_APP_URL + "/my-jobs?job_id=" + jobId
                            }
                        }, {
                            headers: {
                                'Cache-Control': 'no-store, no-cache, must-revalidate'
                            }
                        })];
                case 3:
                    error_1 = _b.sent();
                    // Handle specific Stripe errors
                    if (error_1 instanceof stripe_1.stripe.errors.StripeError) {
                        console.error('Stripe API error:', {
                            type: error_1.type,
                            code: error_1.code,
                            message: error_1.message
                        });
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: error_1.message,
                                code: error_1.code,
                                type: error_1.type
                            }, { status: error_1.statusCode || 500 })];
                    }
                    // Handle general errors
                    console.error('Payment API error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: error_1 instanceof Error ? error_1.message : 'Failed to create payment intent',
                            timestamp: new Date().toISOString()
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
// Handle OPTIONS request for CORS
function OPTIONS() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Response(null, {
                    status: 204,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        'Access-Control-Max-Age': '86400'
                    }
                })];
        });
    });
}
exports.OPTIONS = OPTIONS;
