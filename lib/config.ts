// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM CONFIG HELPER
// lib/config.ts
// ══════════════════════════════════════════════════════════════════════════════

import { prisma } from './prisma';

// Cache for configs (5 minute TTL)
const configCache = new Map<string, { value: any; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a single config value by key
 */
export async function getConfig<T = string>(key: string): Promise<T> {
  // Check cache first
  const cached = configCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value as T;
  }

  // Fetch from database
  const config = await prisma.systemConfig.findUnique({
    where: { key },
  });

  if (!config) {
    throw new Error(`Config not found: ${key}`);
  }

  // Parse based on data type
  let value: any;
  switch (config.dataType) {
    case 'NUMBER':
      value = parseInt(config.value, 10);
      break;
    case 'BOOLEAN':
      value = config.value === 'true';
      break;
    case 'JSON':
      value = JSON.parse(config.value);
      break;
    default:
      value = config.value;
  }

  // Cache the value
  configCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return value as T;
}

/**
 * Get a config value with a default fallback (won't throw if not found)
 */
export async function getConfigOrDefault<T = string>(
  key: string,
  defaultValue: T
): Promise<T> {
  try {
    return await getConfig<T>(key);
  } catch {
    return defaultValue;
  }
}

/**
 * Get multiple configs at once
 */
export async function getConfigs(keys: string[]): Promise<Record<string, any>> {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: keys } },
  });

  const result: Record<string, any> = {};

  for (const config of configs) {
    switch (config.dataType) {
      case 'NUMBER':
        result[config.key] = parseInt(config.value, 10);
        break;
      case 'BOOLEAN':
        result[config.key] = config.value === 'true';
        break;
      case 'JSON':
        result[config.key] = JSON.parse(config.value);
        break;
      default:
        result[config.key] = config.value;
    }
  }

  return result;
}

/**
 * Get all configs by category
 */
export async function getConfigsByCategory(
  category: string
): Promise<Record<string, any>> {
  const configs = await prisma.systemConfig.findMany({
    where: { category },
  });

  const result: Record<string, any> = {};

  for (const config of configs) {
    switch (config.dataType) {
      case 'NUMBER':
        result[config.key] = parseInt(config.value, 10);
        break;
      case 'BOOLEAN':
        result[config.key] = config.value === 'true';
        break;
      case 'JSON':
        result[config.key] = JSON.parse(config.value);
        break;
      default:
        result[config.key] = config.value;
    }
  }

  return result;
}

/**
 * Update a config value (admin only)
 */
export async function updateConfig(
  key: string,
  value: string | number | boolean | object
): Promise<void> {
  const stringValue =
    typeof value === 'object' ? JSON.stringify(value) : String(value);

  await prisma.systemConfig.update({
    where: { key },
    data: { value: stringValue },
  });

  // Invalidate cache
  configCache.delete(key);
}

/**
 * Clear the config cache (useful after bulk updates)
 */
export function clearConfigCache(): void {
  configCache.clear();
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMONLY USED CONFIG KEYS
// ══════════════════════════════════════════════════════════════════════════════

export const CONFIG_KEYS = {
  // Pricing
  EXAM_PACKAGE_PRICE: 'exam_package_price',
  EXAM_PACKAGE_TESTS: 'exam_package_tests',
  EXAM_PACKAGE_VALIDITY_DAYS: 'exam_package_validity_days',

  // Exam Settings
  EXAM_DURATION_MINUTES: 'exam_duration_minutes',
  EXAM_TOTAL_QUESTIONS: 'exam_total_questions',
  EXAM_PASSING_PERCENTAGE: 'exam_passing_percentage',

  // Institute Settings
  DEFAULT_REVENUE_SHARE: 'default_revenue_share',
  MAX_BATCH_SIZE: 'max_batch_size',
  CERTIFICATE_PREFIX: 'certificate_prefix',

  // Platform
  PLATFORM_NAME: 'platform_name',
  SUPPORT_PHONE: 'support_phone',
  SUPPORT_EMAIL: 'support_email',
  UPI_ID: 'upi_id',
  UPI_NAME: 'upi_name',
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR COMMON CONFIGS
// ══════════════════════════════════════════════════════════════════════════════

export async function getExamPackagePrice(): Promise<number> {
  return getConfigOrDefault(CONFIG_KEYS.EXAM_PACKAGE_PRICE, 750);
}

export async function getExamPackageTests(): Promise<number> {
  return getConfigOrDefault(CONFIG_KEYS.EXAM_PACKAGE_TESTS, 5);
}

export async function getExamDuration(): Promise<number> {
  return getConfigOrDefault(CONFIG_KEYS.EXAM_DURATION_MINUTES, 60);
}

export async function getExamTotalQuestions(): Promise<number> {
  return getConfigOrDefault(CONFIG_KEYS.EXAM_TOTAL_QUESTIONS, 50);
}

export async function getPassingPercentage(): Promise<number> {
  return getConfigOrDefault(CONFIG_KEYS.EXAM_PASSING_PERCENTAGE, 40);
}

export async function getDefaultRevenueShare(): Promise<number> {
  return getConfigOrDefault(CONFIG_KEYS.DEFAULT_REVENUE_SHARE, 20);
}