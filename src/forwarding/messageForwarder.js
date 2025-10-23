import config from '../config.js';
import logger from '../utils/logger.js';
import { randomBetween, waitFor } from '../utils/delay.js';

/**
 * @typedef {Object} ForwardResult
 * @property {string} jid
 * @property {boolean} success
 * @property {string} [error]
 */

export class MessageForwarder {
  /**
   * @param {import('@whiskeysockets/baileys').WASocket} socket
   */
  constructor(socket) {
    this.socket = socket;
    this.sourceGroupJid = config.sourceGroupJid;
    this.targetGroupJids = config.targetGroupJids;
    this.config = config;
  }

  isSourceGroup(jid) {
    return jid === this.sourceGroupJid;
  }

  /**
   * @param {import('@whiskeysockets/baileys').WAMessage} message
   * @returns {Promise<ForwardResult[]>}
   */
  async forward(message) {
    const results = [];

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
