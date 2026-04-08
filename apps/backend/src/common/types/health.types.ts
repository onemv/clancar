export type DependencyStatus = 'up' | 'down';

export interface HealthDependencyReport {
  database: DependencyStatus;
  redis: DependencyStatus;
  storage: DependencyStatus;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  dependencies: HealthDependencyReport;
}
