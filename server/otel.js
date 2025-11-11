// otel.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// Đặt tên service để dễ lọc trong Grafana
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'my-backend',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
});

// Exporter đọc endpoint + headers từ biến môi trường OTEL_EXPORTER_OTLP_*
const traceExporter = new OTLPTraceExporter({});
const metricExporter = new OTLPMetricExporter({});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // gửi metrics mỗi 60s
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start()
  .then(() => console.log('✅ OpenTelemetry SDK started'))
  .catch((err) => console.error('❌ OpenTelemetry init error:', err));

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => process.exit(0));
});
