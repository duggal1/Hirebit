"use strict";
exports.__esModule = true;
var google_1 = require("next/font/google");
var google_2 = require("next/font/google");
require("./globals.css");
// Global providers (from your general app)
var Providers_1 = require("@/components/Providers");
// Resume-specific providers (from your resume builder)
var Providers_2 = require("@/components/resume/src/app/components/Providers");
var AutoSaveHeaderWrapper_1 = require("@/components/resume/src/app/components/header/AutoSaveHeaderWrapper");
var sidebar_1 = require("@/components/sidebar/sidebar");
var footer_1 = require("@/components/Landing/Footer/footer");
var geistSans = google_1.Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
});
var geistMono = google_1.Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
});
var inter = google_2.Inter({ subsets: ["latin"] });
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "en", suppressHydrationWarning: true },
        React.createElement("body", { className: geistSans.variable + " " + geistMono.variable + " " + inter.className + " antialiased" },
            React.createElement(Providers_1.Providers, null,
                React.createElement(Providers_2.Providers, null,
                    React.createElement(AutoSaveHeaderWrapper_1.AutoSaveHeaderWrapper, null),
                    React.createElement(sidebar_1["default"], null),
                    React.createElement("main", null, children),
                    React.createElement(footer_1.Footer, null))))));
}
exports["default"] = RootLayout;
