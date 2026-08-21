"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLog = sendLog;
const index_js_1 = require("../kafka/index.js");
const producer = index_js_1.kafka.producer();
async function sendLog({ type = 'info', message, source = 'unknown-service', }) {
    const logPayload = {
        type,
        message,
        timestamp: new Date().toISOString(),
        source,
    };
    await producer.connect();
    await producer.send({
        topic: 'logs',
        messages: [{ value: JSON.stringify(logPayload) }],
    });
    await producer.disconnect();
}
