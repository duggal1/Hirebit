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
exports.sendNewsletter = void 0;
var resend_1 = require("../resend/resend");
var client_1 = require("./client");
var db_1 = require("../db");
var newsletter_1 = require("@/components/email/inngest/newsletter/newsletter");
exports.sendNewsletter = client_1.inngest.createFunction({
    id: "send-newsletter",
    name: "Send Newsletter Email"
}, { event: "newsletter.scheduled" }, function (_a) {
    var event = _a.event, step = _a.step;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, email, companyId, company_1, activeJobs_1, aggregatedMetrics_1, emailResult, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = event.data, email = _b.email, companyId = _b.companyId;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, db_1.prisma.company.findUnique({
                            where: { id: companyId },
                            include: {
                                JobPost: {
                                    where: {
                                        status: "ACTIVE"
                                    },
                                    select: {
                                        id: true,
                                        status: true,
                                        metrics: true
                                    }
                                }
                            }
                        })];
                case 2:
                    company_1 = _c.sent();
                    if (!company_1) {
                        throw new Error("Company not found: " + companyId);
                    }
                    activeJobs_1 = company_1.JobPost.filter(function (job) { return job.status === "ACTIVE"; });
                    aggregatedMetrics_1 = {
                        totalViews: activeJobs_1.reduce(function (sum, job) { var _a; return sum + (((_a = job.metrics) === null || _a === void 0 ? void 0 : _a.totalViews) || 0); }, 0),
                        totalClicks: activeJobs_1.reduce(function (sum, job) { var _a; return sum + (((_a = job.metrics) === null || _a === void 0 ? void 0 : _a.totalClicks) || 0); }, 0),
                        applications: activeJobs_1.reduce(function (sum, job) { var _a; return sum + (((_a = job.metrics) === null || _a === void 0 ? void 0 : _a.applications) || 0); }, 0),
                        ctr: activeJobs_1.reduce(function (sum, job) { var _a; return sum + (((_a = job.metrics) === null || _a === void 0 ? void 0 : _a.ctr) || 0); }, 0) / (activeJobs_1.length || 1),
                        conversionRate: activeJobs_1.reduce(function (sum, job) { var _a; return sum + (((_a = job.metrics) === null || _a === void 0 ? void 0 : _a.conversionRate) || 0); }, 0) / (activeJobs_1.length || 1),
                        viewsByDate: {},
                        clicksByDate: {},
                        locationData: JSON.stringify(activeJobs_1.reduce(function (acc, job) {
                            var _a, _b;
                            var locations = JSON.parse(((_b = (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.locationData) === null || _b === void 0 ? void 0 : _b.toString()) || '{}');
                            Object.entries(locations).forEach(function (_a) {
                                var loc = _a[0], count = _a[1];
                                acc[loc] = (acc[loc] || 0) + count;
                            });
                            return acc;
                        }, {})),
                        topCandidateMatch: JSON.stringify(activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.topCandidateMatch; }).filter(Boolean)[0] || {}),
                        candidateMatchScores: JSON.stringify(activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.candidateMatchScores; }).filter(Boolean)[0] || {}),
                        skillsMatchData: JSON.stringify(activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.skillsMatchData; }).filter(Boolean)[0] || {}),
                        marketTrends: {
                            competitorBenchmark: activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.competitorBenchmark; }).filter(Boolean)[0],
                            marketSalaryData: activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.marketSalaryData; }).filter(Boolean)[0],
                            marketSkillsData: activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.marketSkillsData; }).filter(Boolean)[0],
                            industryTrends: activeJobs_1.map(function (job) { var _a; return (_a = job.metrics) === null || _a === void 0 ? void 0 : _a.industryTrends; }).filter(Boolean)[0]
                        }
                    };
                    return [4 /*yield*/, step.run("send-newsletter-email", function () { return __awaiter(void 0, void 0, void 0, function () {
                            var emailComponent, response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        emailComponent = newsletter_1.NewsletterEmail({
                                            company: {
                                                id: company_1.id,
                                                name: company_1.name,
                                                industry: company_1.industry,
                                                location: company_1.location,
                                                activeJobCount: activeJobs_1.length,
                                                totalJobCount: company_1.JobPost.length,
                                                techStack: company_1.techStack || []
                                            },
                                            metrics: aggregatedMetrics_1,
                                            recipientEmail: email
                                        });
                                        return [4 /*yield*/, resend_1.resend.emails.send({
                                                from: resend_1.RESEND_FROM_EMAIL,
                                                to: [email],
                                                subject: company_1.name + " - Weekly Hiring Analytics",
                                                react: emailComponent
                                            })];
                                    case 1:
                                        response = _a.sent();
                                        return [2 /*return*/, response];
                                }
                            });
                        }); })];
                case 3:
                    emailResult = _c.sent();
                    // Schedule next newsletter
                    return [4 /*yield*/, client_1.inngest.send({
                            name: "newsletter.scheduled",
                            data: { email: email, companyId: companyId },
                            delay: "5d"
                        })];
                case 4:
                    // Schedule next newsletter
                    _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            email: email,
                            companyId: companyId,
                            sentAt: new Date().toISOString()
                        }];
                case 5:
                    error_1 = _c.sent();
                    console.error("Newsletter send failed:", error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
});
