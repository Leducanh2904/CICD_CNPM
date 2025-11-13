// server/otel.js
console.log("ENDPOINT:", process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
console.log("HEADERS RAW:", process.env.OTEL_EXPORTER_OTLP_HEADERS);

'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const headersString = process.env.OTEL_EXPORTER_OTLP_HEADERS || "";

// Parse "Authorization=Basic xxx" -> { Authorization: 'Basic xxx' }
const headers = {};
headersString.split(",").forEach((h) => {
  const [k, v] = h.split("=");
  if (k && v) headers[k.trim()] = v.trim();
});

// exporter cho traces
const traceExporter = new OTLPTraceExporter({
  url: `${endpoint}/v1/traces`,
  headers,
});

// exporter cho metrics
const metricExporter = new OTLPMetricExporter({
  url: `${endpoint}/v1/metrics`,
  headers,
});

// SDK
const sdk = new NodeSDK({
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 15000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// start (sync, không .then)
try {
  sdk.start();
  console.log('OpenTelemetry SDK started');
} catch (err) {
  console.error('Error starting OpenTelemetry SDK', err);
}

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down');
  } catch (err) {
    console.error('Error shutting down OpenTelemetry SDK', err);
  } finally {
    process.exit(0);
  }
});
