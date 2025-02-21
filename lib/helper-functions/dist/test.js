"use strict";
exports.__esModule = true;
exports.generateTestId = void 0;
function generateTestId(jobSeekerId) {
    var uniqueId = crypto.randomUUID();
    return "test_" + jobSeekerId + "_" + uniqueId;
}
exports.generateTestId = generateTestId;
