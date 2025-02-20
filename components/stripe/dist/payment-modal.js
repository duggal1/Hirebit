'use client';
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
exports.PaymentModal = void 0;
var navigation_1 = require("next/navigation");
var dialog_1 = require("@/components/ui/dialog");
var react_stripe_js_1 = require("@stripe/react-stripe-js");
var stripe_js_1 = require("@stripe/stripe-js");
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
//
var stripePromise = stripe_js_1.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
console.log('Stripe Key Available:', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
var appearance = {
    theme: 'night',
    variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'transparent',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '0.875rem',
        fontSizeBase: '0.9375rem'
    },
    rules: {
        '.Input': {
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.2s ease',
            fontSize: '0.9375rem',
            fontWeight: '450',
            padding: '12px'
        },
        '.Input:hover': {
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
        },
        '.Input:focus': {
            border: '1px solid hsl(var(--primary))',
            boxShadow: '0 0 0 1px hsl(var(--primary))'
        },
        '.Label': {
            color: 'hsl(var(--muted-foreground))',
            fontSize: '0.8125rem',
            fontWeight: '500',
            letterSpacing: '0.01em',
            marginBottom: '6px'
        },
        '.Tab': {
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem',
            fontWeight: '450',
            padding: '12px 16px'
        },
        '.Tab:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)'
        },
        '.Tab--selected': {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            fontWeight: '500'
        }
    }
};
function CheckoutForm(_a) {
    var _this = this;
    var onClose = _a.onClose, amount = _a.amount;
    var stripe = react_stripe_js_1.useStripe();
    var elements = react_stripe_js_1.useElements();
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var router = navigation_1.useRouter();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var currentOrigin, returnUrl, submitError, confirmError, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!stripe || !elements) {
                        sonner_1.toast.error('Payment system not ready');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
                    returnUrl = currentOrigin + "/my-jobs?success=true";
                    // Validate return URL
                    if (!returnUrl || !returnUrl.startsWith('http')) {
                        throw new Error('Invalid return URL configuration');
                    }
                    return [4 /*yield*/, elements.submit()];
                case 2:
                    submitError = (_a.sent()).error;
                    if (submitError) {
                        throw new Error(submitError.message);
                    }
                    return [4 /*yield*/, stripe.confirmPayment({
                            elements: elements,
                            confirmParams: {
                                return_url: returnUrl,
                                payment_method_data: {
                                    billing_details: {} // Add billing details if needed
                                }
                            },
                            redirect: 'if_required'
                        })];
                case 3:
                    confirmError = (_a.sent()).error;
                    if (confirmError) {
                        // Handle specific error cases
                        if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
                            sonner_1.toast.error(confirmError.message);
                        }
                        else {
                            sonner_1.toast.error('An unexpected error occurred.');
                        }
                        return [2 /*return*/];
                    }
                    // Payment successful
                    sonner_1.toast.success('Payment successful!');
                    router.push('/my-jobs');
                    onClose();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Payment error:', error_1);
                    sonner_1.toast.error(error_1 instanceof Error ? error_1.message : 'Payment failed');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement("div", { className: "space-y-5" },
            React.createElement("div", { className: "relative border-white/[0.08] bg-black/20 backdrop-blur-2xl border rounded-2xl overflow-hidden" },
                React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30" }),
                React.createElement("div", { className: "relative flex justify-between items-center p-5" },
                    React.createElement("span", { className: "text-muted-foreground text-sm" }, "Amount due"),
                    React.createElement("span", { className: "font-semibold text-lg text-white/80" },
                        "$",
                        amount / 100))),
            React.createElement(react_stripe_js_1.PaymentElement, { className: "[&_*]:!transition-all [&_*]:!duration-200 payment-element", options: {
                    layout: 'tabs'
                } })),
        React.createElement("div", { className: "flex justify-end items-center gap-3 pt-2" },
            React.createElement(button_1.Button, { type: "button", variant: "ghost", onClick: onClose, className: "border-gray-700 bg-white/5 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 border font-medium text-sm text-white transition-all duration-200" }, "Cancel"),
            React.createElement(button_1.Button, { type: "submit", disabled: !stripe || loading, className: "relative bg-transparent disabled:opacity-70 shadow-blue-500/20 shadow-lg hover:shadow-blue-500/30 px-6 py-2.5 rounded-lg" },
                React.createElement("div", { className: "absolute inset-0" },
                    React.createElement("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
                    React.createElement("div", { className: "-top-12 absolute -inset-x-2 bg-blue-400/20 opacity-0 group-hover:opacity-100 blur-2xl h-40 transition-opacity duration-300" })),
                React.createElement("span", { className: "relative z-10 flex justify-center items-center gap-2.5" }, loading ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 text-white animate-spin" }),
                    React.createElement("span", { className: "font-medium text-emerald-600 text-sm" }, "Processing..."))) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.CreditCard, { className: "w-4 h-4 text-emerald-600 hover:text-white transition-transform duration-300" }),
                    React.createElement("span", { className: "font-medium text-sm text-white" },
                        "Pay $",
                        amount / 100))))))));
}
function PaymentModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, priceId = _a.priceId, jobId = _a.jobId;
    var _b = react_1.useState(null), clientSecret = _b[0], setClientSecret = _b[1];
    var _c = react_1.useState(0), amount = _c[0], setAmount = _c[1];
    var _d = react_1.useState(null), error = _d[0], setError = _d[1];
    react_1.useEffect(function () {
        var mounted = true;
        var createPaymentIntent = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isOpen || !priceId || !jobId)
                            return [2 /*return*/]; // Check for jobId
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('/api/payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    priceId: priceId,
                                    jobId: jobId // Use the jobId prop directly
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        if (!mounted)
                            return [2 /*return*/];
                        if (!response.ok) {
                            throw new Error(data.error || 'Payment initialization failed');
                        }
                        setClientSecret(data.clientSecret);
                        setAmount(data.amount);
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error('Payment intent creation failed:', err_1);
                        if (!mounted)
                            return [2 /*return*/];
                        setError(err_1 instanceof Error ? err_1.message : 'Failed to initialize payment');
                        sonner_1.toast.error('Failed to initialize payment. Please try again.');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        createPaymentIntent();
        return function () {
            mounted = false;
        };
    }, [isOpen, priceId, jobId]); // Add jobId to dependencies
    if (error) {
        return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[500px]" },
                React.createElement("div", { className: "p-6 text-center" },
                    React.createElement("p", { className: "text-destructive" }, error),
                    React.createElement(button_1.Button, { onClick: onClose, className: "mt-4" }, "Close")))));
    }
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose },
        React.createElement(dialog_1.DialogContent, { className: "border-white/[0.08]" },
            React.createElement("button", { onClick: onClose, className: "top-4 right-4 absolute hover:bg-white/10 focus:ring-opacity-100 p-2.5 rounded-full text-white/70 hover:text-white transition-all duration-200", "aria-label": "Close", type: "button" // Added type attribute for button
             },
                React.createElement(lucide_react_1.X, { className: "-mt-3 w-6 h-6 text-red-500" })),
            React.createElement("div", { className: "relative" },
                React.createElement("div", { className: "-top-40 -left-40 absolute bg-primary/10 opacity-30 blur-3xl rounded-full w-[500px] h-[500px]" }),
                React.createElement("div", { className: "-right-40 -bottom-40 absolute bg-primary/10 opacity-30 blur-3xl rounded-full w-[500px] h-[500px]" }),
                React.createElement("div", { className: "relative space-y-6 p-6" },
                    React.createElement("div", { className: "space-y-1.5" },
                        React.createElement(dialog_1.DialogTitle, { className: "font-semibold text-2xl text-white tracking-tight" }, "Complete Your Purchase"),
                        React.createElement("p", { className: "text-muted-foreground text-sm" }, "Please enter your payment details below")),
                    clientSecret ? (React.createElement(react_stripe_js_1.Elements, { stripe: stripePromise, options: {
                            clientSecret: clientSecret,
                            appearance: appearance
                        } },
                        React.createElement(CheckoutForm, { onClose: onClose, amount: amount }))) : (React.createElement("div", { className: "flex justify-center items-center py-12" },
                        React.createElement("div", { className: "relative" },
                            React.createElement("div", { className: "absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" }),
                            React.createElement("div", { className: "relative bg-gradient-to-b from-primary/80 to-primary p-4 rounded-full" },
                                React.createElement(lucide_react_1.Loader2, { className: "w-6 h-6 text-primary-foreground animate-spin" }))))))))));
}
exports.PaymentModal = PaymentModal;
