"use strict";
// packages/utils/logger.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logDebug = logDebug;
exports.logWarn = logWarn;
exports.logError = logError;
function formatLocalTime() {
    // Human‑friendly local time with seconds + milliseconds
    return (new Date().toLocaleTimeString([], { hour12: false }) +
        '.' +
        new Date().getMilliseconds());
}
// ANSI color codes for readability
const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    green: '\x1b[32m',
};
function logInfo(message, data) {
    const prefix = `${colors.cyan}[INFO ${formatLocalTime()}]${colors.reset}`;
    data !== undefined
        ? console.log(prefix, message, data)
        : console.log(prefix, message);
}
function logDebug(message, data) {
    const prefix = `${colors.green}[DEBUG ${formatLocalTime()}]${colors.reset}`;
    data !== undefined
        ? console.log(prefix, message, data)
        : console.log(prefix, message);
}
function logWarn(message, data) {
    const prefix = `${colors.yellow}[WARN ${formatLocalTime()}]${colors.reset}`;
    data !== undefined
        ? console.log(prefix, message, data)
        : console.log(prefix, message);
}
function logError(message, data) {
    const prefix = `${colors.red}[ERROR ${formatLocalTime()}]${colors.reset}`;
    data !== undefined
        ? console.error(prefix, message, data)
        : console.error(prefix, message);
}
