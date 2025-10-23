import { WAMessage, WASocket } from '@adiwajshing/baileys';
import config, { BotConfig } from '../config';
import logger from '../utils/logger';
import { randomBetween, waitFor } from '../utils/delay';
import { ForwardResult } from '../messages/summaryReporter';

export class MessageForwarder {
  private readonly sourceGroupJid: string;
  private readonly targetGroupJids: string[];
  private readonly config: BotConfig;

  constructor(private readonly socket: WASocket) {
    this.config = config;
    this.sourceGroupJid = this.config.sourceGroupJid;
    this.targetGroupJids = this.config.targetGroupJids;
  }

  isSourceGroup(jid: string | undefined): boolean {
    return jid === this.sourceGroupJid;
  }

  async forward(message: WAMessage): Promise<ForwardResult[]> {
    const results: ForwardResult[] = [];

    for (const target of this.targetGroupJids) {
      const delayMs = randomBetween(this.config.minForwardDelayMs, this.config.maxForwardDelayMs);
      logger.debug({ target, delayMs }, 'Waiting before forwarding message');
      await waitFor(delayMs);

      try {
        await this.socket.copyNForward(target, message, true);
        logger.info({ target }, 'Message forwarded successfully');
        results.push({ jid: target, success: true });
      } catch (error) {
        const description = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ err: error, target }, 'Failed to forward message');
        results.push({ jid: target, success: false, error: description });
      }
    }

    return results;
  }
}
