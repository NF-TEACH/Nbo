import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const ConfigSchema = z.object({
  sourceGroupJid: z.string().min(1, 'SOURCE_GROUP_JID must be provided'),
  targetGroupJids: z.array(z.string().min(1)).min(1, 'At least one target group JID is required'),
  minForwardDelayMs: z.number().int().nonnegative(),
  maxForwardDelayMs: z.number().int().nonnegative()
}).refine((value) => value.maxForwardDelayMs >= value.minForwardDelayMs, {
  message: 'MAX_FORWARD_DELAY_MS must be greater than or equal to MIN_FORWARD_DELAY_MS'
});

const parseList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

const MIN_DELAY_DEFAULT = 5_000;
const MAX_DELAY_DEFAULT = 15_000;

const rawConfig = {
  sourceGroupJid: process.env.SOURCE_GROUP_JID ?? '',
  targetGroupJids: parseList(process.env.TARGET_GROUP_JIDS),
  minForwardDelayMs: process.env.MIN_FORWARD_DELAY_MS ? Number(process.env.MIN_FORWARD_DELAY_MS) : MIN_DELAY_DEFAULT,
  maxForwardDelayMs: process.env.MAX_FORWARD_DELAY_MS ? Number(process.env.MAX_FORWARD_DELAY_MS) : MAX_DELAY_DEFAULT
};

const parsed = ConfigSchema.safeParse(rawConfig);

if (!parsed.success) {
  const formattedErrors = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
  throw new Error(`Invalid configuration. Please verify your environment variables.\n${formattedErrors}`);
}

export type BotConfig = z.infer<typeof ConfigSchema>;

const config: BotConfig = parsed.data;

export default config;
