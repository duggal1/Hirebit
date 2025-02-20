'use client';
"use strict";
exports.__esModule = true;
exports.Footer = void 0;
var link_1 = require("next/link");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
function Footer() {
    var currentYear = new Date().getFullYear();
    var footerSections = [
        {
            title: 'Job Board',
            links: [
                { name: 'Browse Jobs', href: '#jobs' },
                { name: 'Post a Job', href: '#post-job' },
                { name: 'Guidelines', href: '/guidelines' },
                { name: 'Changelog', href: '/changelog' },
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/about' },
                { name: 'Blog', href: '/blog' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact', href: '/contact' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy', href: '/privacy' },
                { name: 'Terms', href: '/terms' },
                { name: 'Security', href: '/security' },
            ]
        },
    ];
    return (React.createElement("footer", { className: "relative border-white/10 bg-transparent backdrop-blur-3xl border-t" },
        React.createElement("div", { className: "" }),
        React.createElement("div", { className: "relative mx-auto px-6 py-16 container" },
            React.createElement("div", { className: "gap-8 grid grid-cols-2 md:grid-cols-4" },
                React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "col-span-2" },
                    React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2 group" },
                        React.createElement("div", { className: "relative" },
                            React.createElement("div", { className: "absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl rounded-full transition-opacity duration-500" }),
                            React.createElement("div", { className: "relative bg-gradient-to-b from-primary/30 to-primary/10 p-2 rounded-full" },
                                React.createElement(lucide_react_1.Sparkles, { className: "w-6 h-6 text-primary" }))),
                        React.createElement("span", { className: "bg-clip-text bg-gradient-to-r from-white via-white to-white/80 font-bold text-transparent text-xl animate-text-shimmer" }, "Hirebit")),
                    React.createElement("p", { className: "mt-4 max-w-md text-sm text-white/60" }, "The leading job board platform connecting top talent with the best opportunities.")),
                footerSections.map(function (section, sectionIndex) { return (React.createElement(framer_motion_1.motion.div, { key: section.title, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: sectionIndex * 0.1 } },
                    React.createElement("h3", { className: "bg-clip-text bg-gradient-to-r from-white via-white to-white/80 font-semibold text-transparent" }, section.title),
                    React.createElement("ul", { className: "space-y-2 mt-4" }, section.links.map(function (link, linkIndex) { return (React.createElement(framer_motion_1.motion.li, { key: link.name, initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: (sectionIndex * 0.1) + (linkIndex * 0.05) } },
                        React.createElement(link_1["default"], { href: link.href, className: "relative text-sm text-white/60 hover:text-white transition-colors group" },
                            React.createElement("span", { className: "relative z-10" }, link.name),
                            React.createElement("span", { className: "group-hover:scale-x-100 -bottom-1 absolute inset-x-0 bg-gradient-to-r from-primary/50 to-violet-500/50 h-px transform transition-transform duration-300 scale-x-0" })))); })))); })),
            React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "relative border-white/10 mt-16 pt-8 border-t" },
                React.createElement("div", { className: "flex md:flex-row flex-col justify-between items-center gap-6" },
                    React.createElement("p", { className: "text-lg text-white/60 hover:text-white/80 transition-colors" },
                        "\u00A9 ",
                        currentYear,
                        " Hirebit. Connecting talent with opportunities."),
                    React.createElement("div", { className: "flex items-center gap-8 text-xl" }, [
                        {
                            name: '𝕏',
                            href: 'https://twitter.com/harshitduggal5',
                            hoverClass: 'hover:text-white'
                        },
                        {
                            name: 'GitHub',
                            href: 'https://github.com/duggal1',
                            hoverClass: 'hover:text-white'
                        },
                        {
                            name: 'Discord',
                            href: 'https://discord.gg',
                            hoverClass: 'hover:text-white'
                        },
                    ].map(function (social, index) { return (React.createElement(framer_motion_1.motion.div, { key: social.name, initial: { opacity: 0, y: 10 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: index * 0.1 } },
                        React.createElement(link_1["default"], { href: social.href, target: "_blank", rel: "noopener noreferrer", className: "relative text-white/60 transition-all duration-300 " + social.hoverClass + " group" },
                            React.createElement("span", { className: "relative z-10" }, social.name),
                            React.createElement("span", { className: "group-hover:scale-x-100 -bottom-1 absolute inset-x-0 bg-gradient-to-r from-primary/50 to-violet-500/50 rounded-full h-[2px] transform transition-transform duration-300 scale-x-0" })))); })))))));
}
exports.Footer = Footer;
