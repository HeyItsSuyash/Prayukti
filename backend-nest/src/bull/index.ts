export { BullQueueModule } from './bull.module';
export { QUEUE_NAMES, DEFAULT_JOB_OPTIONS, DLQ_SUFFIX } from './bull.constants';
export type { QueueName } from './bull.constants';

// Producers
export { EmailProducer } from './queues/email.producer';
export { NotificationsProducer } from './queues/notifications.producer';
export { AiProducer } from './queues/ai.producer';
export { VideoProducer } from './queues/video.producer';
export { AnalyticsProducer } from './queues/analytics.producer';
export { CertificateProducer } from './queues/certificate.producer';

// Job data types
export type { SendEmailJobData, SendOtpEmailJobData } from './queues/email.producer';
export type { NotificationJobData } from './queues/notifications.producer';
export type { AiJobData } from './queues/ai.producer';
export type { VideoJobData } from './queues/video.producer';
export type { AnalyticsJobData, AnalyticsEventType } from './queues/analytics.producer';
export type { CertificateJobData } from './queues/certificate.producer';

// Workers Module
export { WorkersModule } from './workers/workers.module';
