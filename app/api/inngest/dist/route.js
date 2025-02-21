"use strict";
var _a;
exports.__esModule = true;
exports.PUT = exports.POST = exports.GET = void 0;
var client_1 = require("@/app/utils/inngest/client");
var email_1 = require("@/app/utils/inngest/email");
var next_1 = require("inngest/next");
console.log("Registering Inngest functions");
var functions = [email_1.sendPaymentInvoiceEmail];
console.log("Available functions:", functions.map(function (f) { return f.name; }));
exports.GET = (_a = next_1.serve({
    client: client_1.inngest,
    functions: functions,
    logLevel: "debug"
}), _a.GET), exports.POST = _a.POST, exports.PUT = _a.PUT;
console.log("Inngest functions registered");
