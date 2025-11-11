// otel.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 60_000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Ở version hiện tại start() có thể trả về void ⇒ KHÔNG dùng .then()
try {
  sdk.start();
  console.log('✅ OpenTelemetry SDK started');
} catch (e) {
  console.error('❌ OTel init error:', e);
}

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
  } catch (e) {
    console.error('❌ OTel shutdown error:', e);
  } finally {
    process.exit(0);
  }
});
