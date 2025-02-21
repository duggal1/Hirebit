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
exports.__esModule = true;
var react_1 = require("react");
var react_chartjs_2_1 = require("react-chartjs-2");
var card_1 = require("@/components/ui/card");
var framer_motion_1 = require("framer-motion");
// Enhanced gradient plugin with dynamic colors and glass morphism effect
var gradientLineConfig = {
    id: 'gradientLine',
    beforeDatasetsDraw: function (chart) {
        var ctx = chart.ctx, chartArea = chart.chartArea;
        if (!chartArea)
            return;
        // Create vertical gradient with glass morphism effect
        var gradientVertical = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradientVertical.addColorStop(0, 'rgba(147, 51, 234, 0.5)');
        gradientVertical.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
        gradientVertical.addColorStop(1, 'rgba(79, 70, 229, 0.02)');
        // Create horizontal gradient for line with ultra-modern colors
        var gradientLine = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
        gradientLine.addColorStop(0, 'rgba(147, 51, 234, 1)');
        gradientLine.addColorStop(0.3, 'rgba(236, 72, 153, 1)');
        gradientLine.addColorStop(0.6, 'rgba(79, 70, 229, 1)');
        gradientLine.addColorStop(1, 'rgba(124, 58, 237, 1)');
        if (chart.data.datasets[0]) {
            chart.data.datasets[0].backgroundColor = gradientVertical;
            chart.data.datasets[0].borderColor = gradientLine;
        }
    }
};
// Enhanced glow effect plugin with dynamic shadows
var glowEffect = {
    id: 'glowEffect',
    beforeDatasetsDraw: function (chart) {
        var ctx = chart.ctx;
        ctx.shadowColor = 'rgba(147, 51, 234, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    },
    afterDatasetsDraw: function (chart) {
        var ctx = chart.ctx;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
};
var ModernVisualizations = function (_a) {
    var lineData = _a.lineData, barData = _a.barData, pieData = _a.pieData, mapData = _a.mapData;
    var chartRef = react_1.useRef(null);
    var isInView = framer_motion_1.useInView(chartRef, { once: false, amount: 0.2 });
    var controls = framer_motion_1.useAnimation();
    react_1.useEffect(function () {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);
    var lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleFont: {
                    family: 'Inter',
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12
                },
                padding: 16,
                borderColor: 'rgba(147, 51, 234, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) { return context.parsed.y + " views"; }
                },
                animation: {
                    duration: 200
                },
                boxPadding: 8,
                usePointStyle: true,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    maxRotation: 0
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    padding: 12,
                    callback: function (value) { return value + "k"; }
                },
                border: {
                    display: false
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 3,
                fill: true
            },
            point: {
                radius: 0,
                hoverRadius: 8,
                backgroundColor: 'rgba(147, 51, 234, 1)',
                borderColor: '#fff',
                borderWidth: 3,
                hoverBorderWidth: 4,
                hitRadius: 50
            }
        },
        interaction: {
            intersect: false,
            mode: 'nearest'
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        }
    };
    var barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleFont: {
                    family: 'Inter',
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12
                },
                padding: 16,
                cornerRadius: 12,
                displayColors: false,
                animation: {
                    duration: 200
                },
                boxPadding: 8
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    maxRotation: 0
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    padding: 12
                },
                border: {
                    display: false
                }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        }
    };
    var pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        family: 'Inter',
                        size: 12,
                        weight: 500
                    },
                    color: 'rgba(148, 163, 184, 0.9)',
                    padding: 24,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleFont: {
                    family: 'Inter',
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12
                },
                padding: 16,
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                    label: function (context) { return context.label + ": " + context.parsed + "%"; }
                }
            }
        },
        cutout: '80%',
        radius: '90%',
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: 'easeOutQuart'
        }
    };
    var modernLineData = __assign(__assign({}, lineData), { datasets: lineData.datasets.map(function (dataset) { return (__assign(__assign({}, dataset), { pointHoverBackgroundColor: 'rgba(147, 51, 234, 1)', pointHoverBorderColor: '#fff' })); }) });
    var modernBarData = __assign(__assign({}, barData), { datasets: barData.datasets.map(function (dataset) { return (__assign(__assign({}, dataset), { backgroundColor: 'rgba(147, 51, 234, 0.9)', hoverBackgroundColor: 'rgba(236, 72, 153, 0.9)', borderRadius: 16, borderSkipped: false, barThickness: 24, maxBarThickness: 32 })); }) });
    var modernPieData = __assign(__assign({}, pieData), { datasets: pieData.datasets.map(function (dataset) { return (__assign(__assign({}, dataset), { backgroundColor: [
                'rgba(147, 51, 234, 0.9)',
                'rgba(236, 72, 153, 0.9)',
                'rgba(79, 70, 229, 0.9)'
            ], hoverBackgroundColor: [
                'rgba(147, 51, 234, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(79, 70, 229, 1)'
            ], borderWidth: 0, hoverOffset: 15 })); }) });
    var cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut'
            }
        }
    };
    return (react_1["default"].createElement("div", { ref: chartRef, className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
        react_1["default"].createElement(framer_motion_1.motion.div, { variants: cardVariants, initial: "hidden", animate: controls, className: "relative group" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" }),
            react_1["default"].createElement(card_1.Card, { className: "bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_8px_40px_-12px_rgba(147,51,234,0.2)] transition-all duration-500" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-8" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400" }, "Activity Trends"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-1 font-medium" }, "Real-time view engagement")),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm" },
                        react_1["default"].createElement("span", { className: "h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" }),
                        react_1["default"].createElement("span", { className: "text-purple-400 font-medium" }, "Live"))),
                react_1["default"].createElement("div", { className: "h-[300px]" },
                    react_1["default"].createElement(react_chartjs_2_1.Line, { data: modernLineData, options: lineOptions, plugins: [gradientLineConfig, glowEffect] })))),
        react_1["default"].createElement(framer_motion_1.motion.div, { variants: cardVariants, initial: "hidden", animate: controls, transition: { delay: 0.2 }, className: "relative group" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" }),
            react_1["default"].createElement(card_1.Card, { className: "bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_8px_40px_-12px_rgba(147,51,234,0.2)] transition-all duration-500" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-8" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400" }, "Job Post Performance"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-1 font-medium" }, "Views per posting")),
                    react_1["default"].createElement("div", { className: "px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20" },
                        react_1["default"].createElement("span", { className: "text-sm text-purple-400 font-medium" }, "Last 30 days"))),
                react_1["default"].createElement("div", { className: "h-[300px]" },
                    react_1["default"].createElement(react_chartjs_2_1.Bar, { data: modernBarData, options: barOptions, plugins: [glowEffect] })))),
        react_1["default"].createElement(framer_motion_1.motion.div, { variants: cardVariants, initial: "hidden", animate: controls, transition: { delay: 0.4 }, className: "col-span-1 lg:col-span-2 relative group" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" }),
            react_1["default"].createElement(card_1.Card, { className: "bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_8px_40px_-12px_rgba(147,51,234,0.2)] transition-all duration-500" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-8" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400" }, "Engagement Distribution"),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-1 font-medium" }, "Click-through analysis"))),
                react_1["default"].createElement("div", { className: "h-[400px] flex items-center justify-center" },
                    react_1["default"].createElement("div", { className: "w-[400px]" },
                        react_1["default"].createElement(react_chartjs_2_1.Pie, { data: modernPieData, options: pieOptions, plugins: [glowEffect] })))))));
};
exports["default"] = ModernVisualizations;
