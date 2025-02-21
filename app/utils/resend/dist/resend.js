"use strict";
exports.__esModule = true;
exports.RESEND_FROM_EMAIL = exports.resend = void 0;
var resend_1 = require("resend");
if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined');
}
exports.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
exports.RESEND_FROM_EMAIL = "invoices@" + process.env.RESEND_DOMAIN;
