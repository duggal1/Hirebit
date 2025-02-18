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
exports.POST = void 0;
var server_1 = require("next/server");
var db_1 = require("@/app/utils/db");
var hooks_1 = require("@/app/utils/hooks");
var gemini_1 = require("@/app/utils/gemini");
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var body, jobData, user, company, prompt, generatedContent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, req.json()];
                case 1:
                    body = _a.sent();
                    jobData = body.jobData;
                    if (!jobData) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Missing jobData" }, { status: 400 })];
                    }
                    return [4 /*yield*/, hooks_1.requireUser()];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, db_1.prisma.company.findUnique({
                            where: { userId: user.id },
                            select: {
                                name: true,
                                location: true,
                                companyType: true,
                                about: true,
                                industry: true
                            }
                        })];
                case 3:
                    company = _a.sent();
                    prompt = "Generate a highly detailed job post description in a fresh, calm, formal yet friendly tone.\nThe job post must follow this exact structure and formatting and MUST begin with the Job Title in a prominent manner, immediately followed by an \"Overview\" section that introduces the role. Do not start the output with the company name.\n\n\nOverview\n\nProvide a compelling introduction that explains the role, highlights the company's mission and culture (for example, include statements like \"Microsoft\u2019s mission is to empower every person and every organization...\"), and outlines why this opportunity is exciting. Ensure that the job title is featured prominently at the very beginning of this section.\n\n\nQualifications\n\nList the required qualifications with realistic experience ranges (e.g., \"4+ years of experience\" or \"7+ years of experience\") along with required education and technical skills, such as proficiency with C, C++, C#, Java, JavaScript, Python, Docker, and advanced Kubernetes.\n\n\nPreferred Qualifications\n\nInclude additional desirable skills and experiences, along with any extra certifications or advanced technical proficiencies. Also mention specific tools and platforms (e.g., Azure Data Lake, Cosmos DB, Power BI) where relevant.\n\n\nCompensation & Benefits\n\nProvide a realistic base salary range along with additional perks and benefits. If applicable, include details like bonus amounts, medical benefits, and any other compensation specifics.\n\n\nResponsibilities\n\nClearly outline the key responsibilities of the role. Detail the day-to-day tasks and include explicit references to cloud services, databases, frameworks, and other technical tools (for example, Azure Data Lake, Cosmos DB, Power BI, etc.).\n\nBelow are the details provided:\n\n--- Job Details ---\nJob Title: " + jobData.jobTitle + "\nEmployment Type: " + jobData.employmentType + "\nLocation: " + jobData.location + "\nSalary Range: " + jobData.salaryFrom + " - " + jobData.salaryTo + "\nListing Duration: " + jobData.listingDuration + " days\nBenefits: " + (Array.isArray(jobData.benefits) ? jobData.benefits.join(", ") : jobData.benefits) + "\nCurrent Description: " + jobData.jobDescription + "\n\n--- Job Requirements ---\nSkills Required: " + (Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired.join(", ") : jobData.skillsRequired) + "\nPosition Requirement: " + jobData.positionRequirement + "\nRequired Experience: " + jobData.requiredExperience + " years (ensure realistic ranges such as \"4+ years\" or \"7+ years\" are mentioned)\nJob Category: " + jobData.jobCategory + "\nInterview Stages: " + jobData.interviewStages + "\nVisa Sponsorship Available: " + (jobData.visaSponsorship ? "Yes" : "No") + "\nCompensation Details: " + (typeof jobData.compensationDetails === "object" ? JSON.stringify(jobData.compensationDetails) : jobData.compensationDetails) + "\n\n--- Company Information ---\nCompany Name: " + ((company === null || company === void 0 ? void 0 : company.name) || jobData.companyName) + "\nCompany Location: " + ((company === null || company === void 0 ? void 0 : company.location) || jobData.companyLocation) + "\nCompany Type: " + ((company === null || company === void 0 ? void 0 : company.companyType) || "Not Specified") + "\nIndustry: " + ((company === null || company === void 0 ? void 0 : company.industry) || "Not Specified") + "\nAbout the Company: " + ((company === null || company === void 0 ? void 0 : company.about) || jobData.companyDescription) + "\n\nUsing the above details, generate a complete, engaging, and professionally formatted job post that closely matches the style of a Microsoft job posting. Ensure that the output begins with the job title and overview, and includes explicit company branding, realistic qualification ranges, detailed compensation and benefits, and specific technical responsibilities with references to cloud services and frameworks.\n-------------------------------";
                    return [4 /*yield*/, gemini_1.getGeminiGeneratedContent(prompt)];
                case 4:
                    generatedContent = _a.sent();
                    // Return the generated content
                    return [2 /*return*/, server_1.NextResponse.json({ generatedContent: generatedContent }, { status: 200 })];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error generating content:", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to generate content" }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
