"use strict";

var _client = require("@prisma/client");

// fetchjobseeker.js
var prisma = new _client.PrismaClient();

function main() {
  var jobSeekers;
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(prisma.jobApplication.findMany());

        case 2:
          jobSeekers = _context.sent;
          // Print the results to the terminal with full depth
          console.dir(jobSeekers, {
            depth: null
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}

main()["catch"](function (e) {
  console.error('Error fetching JobSeekers:', e);
  process.exit(1);
})["finally"](function _callee() {
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(prisma.$disconnect());

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
});