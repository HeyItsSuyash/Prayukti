export type HealthStatus = 'ok' | 'error';

export interface ComponentHealth {
  status: HealthStatus;
  message?: string;
  latencyMs?: number;
}

export interface MemoryInfo {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  externalMb: number;
}

export interface HealthCheckResult {
  status: HealthStatus;
  backend: HealthStatus;
  postgres: ComponentHealth;
  redis: ComponentHealth;
  uptime: string;
  memory: MemoryInfo;
  timestamp: string;
  version: string;
  environment: string;
}
