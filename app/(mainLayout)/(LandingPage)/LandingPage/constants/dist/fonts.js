"use strict";
exports.__esModule = true;
exports.inter = exports.satoshi = exports.satoshi2 = void 0;
var google_1 = require("next/font/google");
var local_1 = require("next/font/local");
exports.satoshi2 = local_1["default"]({
    src: [
        // {
        //     path: "../../public/fonts/Satoshi-Thin.woff2",
        //     weight: "200",
        // },
        {
            path: "@/app/(mainLayout)/(LandingPage)/LandingPage/public/fonts/Satoshi-Light.woff2",
            weight: "300"
        },
        {
            path: "@/app/(mainLayout)/(LandingPage)/LandingPage/public/fonts/Satoshi-Regular.woff2",
            weight: "400"
        },
        {
            path: "@/app/(mainLayout)/(LandingPage)/LandingPage/public/fonts/Satoshi-Medium.woff2",
            weight: "500"
        },
        {
            path: "@/app/(mainLayout)/(LandingPage)/LandingPage/public/fonts/Satoshi-Bold.woff2",
            weight: "700"
        },
        {
            path: "@/app/(mainLayout)/(LandingPage)/LandingPage/public/fonts/Satoshi-Black.woff2",
            weight: "900"
        },
    ],
    variable: "--font-satoshi"
});
exports.satoshi = google_1.Poppins({
    subsets: ["latin"],
    variable: "--font-inter",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});
exports.inter = google_1.Inter({
    subsets: ["latin"],
    variable: "--font-inter"
});
