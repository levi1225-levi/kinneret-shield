import { IsEnum, IsNumber, IsString, IsURL, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_ANON_KEY: string;

  @IsString()
  SUPABASE_SERVICE_ROLE_KEY: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  JWT_EXPIRATION: number = 86400;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsURL()
  GOOGLE_CALLBACK_URL: string;

  @IsURL()
  CORS_ORIGIN: string = 'http://localhost:3001';

  @IsString()
  DEVICE_AUTH_SECRET: string;

  @IsNumber()
  DEVICE_HEARTBEAT_INTERVAL: number = 30000;

  @IsNumber()
  DEVICE_HEARTBEAT_TIMEOUT: number = 120000;

  @IsNumber()
  AUTO_CHECKOUT_TIMEOUT: number = 3600000;

  @IsNumber()
  ATTENDANCE_ALERT_THRESHOLD: number = 2;

  @IsString()
  DAILY_REPORT_CRON: string = '0 0 * * *';

  @IsString()
  LOG_LEVEL: string = 'debug';

  @IsString()
  WEBHOOK_SECRET: string = 'webhook-secret';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export const appConfig = {
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === Environment.Development;
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === Environment.Production;
  },
  get isTest(): boolean {
    return process.env.NODE_ENV === Environment.Test;
  },
};
