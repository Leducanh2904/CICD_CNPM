// otel.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const headers = {};

// Parse headers string: "Authorization=Basic xxxxx"
process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',').forEach(h => {
  const [key, value] = h.split('=');
  headers[key] = value;
});

// Traces exporter
const traceExporter = new OTLPTraceExporter({
  url: endpoint + '/v1/traces',
  headers,
});

// Metrics exporter
const metricExporter = new OTLPMetricExporter({
  url: endpoint + '/v1/metrics',
  headers,
});

// SDK setup
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'cicd-cnpm-1',
  }),
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 15000,
  }),
});

sdk.start()
  .then(() => console.log("OpenTelemetry SDK started"))
  .catch((err) => console.error("OTel SDK error:", err));

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
