// packages/utils/logger.ts

function formatLocalTime(): string {
  // Human‑friendly local time with seconds + milliseconds
  return (
    new Date().toLocaleTimeString([], { hour12: false }) +
    '.' +
    new Date().getMilliseconds()
  );
}

// ANSI color codes for readability
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
};

export function logInfo(message: string, data?: any) {
  const prefix = `${colors.cyan}[INFO ${formatLocalTime()}]${colors.reset}`;
  data !== undefined
    ? console.log(prefix, message, data)
    : console.log(prefix, message);
}

export function logDebug(message: string, data?: any) {
  const prefix = `${colors.green}[DEBUG ${formatLocalTime()}]${colors.reset}`;
  data !== undefined
    ? console.log(prefix, message, data)
    : console.log(prefix, message);
}

export function logWarn(message: string, data?: any) {
  const prefix = `${colors.yellow}[WARN ${formatLocalTime()}]${colors.reset}`;
  data !== undefined
    ? console.log(prefix, message, data)
    : console.log(prefix, message);
}

export function logError(message: string, data?: any) {
  const prefix = `${colors.red}[ERROR ${formatLocalTime()}]${colors.reset}`;
  data !== undefined
    ? console.error(prefix, message, data)
    : console.error(prefix, message);
}
