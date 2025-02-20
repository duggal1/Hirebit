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
// Define a custom plugin and type it using Chart.js's Plugin type.
var gradientLineConfig = {
    id: 'gradientLine',
    beforeDatasetsDraw: function (chart) {
        var ctx = chart.ctx, chartArea = chart.chartArea;
        if (!chartArea)
            return;
        var gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.5)'); // Purple
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.1)'); // Indigo
        // If needed, you could assign this gradient to a dataset property here.
    }
};
var UltraModernVisualizations = function (_a) {
    var lineData = _a.lineData, barData = _a.barData, pieData = _a.pieData, mapData = _a.mapData;
    // Ultra modern line chart options with type annotation.
    var lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                titleFont: {
                    family: 'Inter',
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12
                },
                padding: 12,
                borderColor: 'rgba(147, 51, 234, 0.2)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) { return context.parsed.y + " views"; }
                }
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
                    color: 'rgba(148, 163, 184, 0.7)'
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    padding: 10,
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
                borderWidth: 2,
                borderColor: 'rgba(147, 51, 234, 1)',
                fill: true,
                backgroundColor: 'rgba(147, 51, 234, 0.1)'
            },
            point: {
                radius: 0,
                hoverRadius: 6,
                backgroundColor: 'rgba(147, 51, 234, 1)',
                borderColor: '#fff',
                borderWidth: 2,
                hoverBorderWidth: 3
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
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
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                titleFont: {
                    family: 'Inter',
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: false
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
                    color: 'rgba(148, 163, 184, 0.7)'
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    padding: 10
                },
                border: {
                    display: false
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
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
                        size: 12
                    },
                    color: 'rgba(148, 163, 184, 0.7)',
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                titleFont: {
                    family: 'Inter',
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        cutout: '75%',
        radius: '90%',
        animation: {
            animateRotate: true,
            animateScale: true
        }
    };
    // Styled datasets
    var modernLineData = __assign(__assign({}, lineData), { datasets: lineData.datasets.map(function (dataset) { return (__assign(__assign({}, dataset), { borderColor: 'rgba(147, 51, 234, 1)', backgroundColor: 'rgba(147, 51, 234, 0.1)', pointBackgroundColor: 'rgba(147, 51, 234, 1)', pointBorderColor: '#fff' })); }) });
    var modernBarData = __assign(__assign({}, barData), { datasets: barData.datasets.map(function (dataset) { return (__assign(__assign({}, dataset), { backgroundColor: 'rgba(147, 51, 234, 0.8)', hoverBackgroundColor: 'rgba(147, 51, 234, 1)', borderRadius: 12, borderSkipped: false })); }) });
    var modernPieData = __assign(__assign({}, pieData), { datasets: pieData.datasets.map(function (dataset) { return (__assign(__assign({}, dataset), { backgroundColor: [
                'rgba(147, 51, 234, 0.8)',
                'rgba(79, 70, 229, 0.8)',
                'rgba(59, 130, 246, 0.8)'
            ], borderWidth: 0 })); }) });
    return (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
        react_1["default"].createElement(card_1.Card, { className: "bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-100" }, "Activity Trends"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-1" }, "Real-time view engagement")),
                react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-gray-400" },
                    react_1["default"].createElement("span", { className: "h-2 w-2 rounded-full bg-purple-500" }),
                    "Active now")),
            react_1["default"].createElement("div", { className: "h-[300px]" },
                react_1["default"].createElement(react_chartjs_2_1.Line, { data: modernLineData, options: lineOptions, plugins: [gradientLineConfig] }))),
        react_1["default"].createElement(card_1.Card, { className: "bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-100" }, "Job Post Performance"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-1" }, "Views per posting")),
                react_1["default"].createElement("div", { className: "text-sm text-purple-400 font-medium" }, "Last 30 days")),
            react_1["default"].createElement("div", { className: "h-[300px]" },
                react_1["default"].createElement(react_chartjs_2_1.Bar, { data: modernBarData, options: barOptions }))),
        react_1["default"].createElement(card_1.Card, { className: "col-span-1 lg:col-span-2 bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-100" }, "Engagement Distribution"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-1" }, "Click-through analysis"))),
            react_1["default"].createElement("div", { className: "h-[400px] flex items-center justify-center" },
                react_1["default"].createElement("div", { className: "w-[400px]" },
                    react_1["default"].createElement(react_chartjs_2_1.Pie, { data: modernPieData, options: pieOptions }))))));
};
exports["default"] = UltraModernVisualizations;
