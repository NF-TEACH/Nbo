import logger from '../utils/logger.js';

const formatGroupList = (jids) => jids.map((jid) => jid.replace(/@g\.us$/, '')).join(', ');

export class SummaryReporter {
  /**
   * @param {import('@adiwajshing/baileys').WASocket} socket
   * @param {string} sourceGroupJid
   */
  constructor(socket, sourceGroupJid) {
    this.socket = socket;
    this.sourceGroupJid = sourceGroupJid;
  }

  /**
   * @param {{ kind: string, preview?: string }} descriptor
   * @param {Array<{ jid: string, success: boolean, error?: string }>} results
   */
  async sendSummary(descriptor, results) {
    const successful = results.filter((result) => result.success).map((result) => result.jid);
    const failed = results.filter((result) => !result.success);

    const lines = [];

    lines.push(`סיכום העברה: הודעת ${descriptor.kind}`);
    if (descriptor.preview) {
      lines.push(`תצוגה מקדימה: ${descriptor.preview}`);
    }

    if (successful.length > 0) {
      lines.push(`הועברה בהצלחה לקבוצות: ${formatGroupList(successful)}`);
    }

    if (failed.length > 0) {
      lines.push('שגיאות העברה:');
      failed.forEach((item) => {
        lines.push(`- ${item.jid}: ${item.error ?? 'סיבה לא ידועה'}`);
      });
    }

    const summaryMessage = lines.join('\n');

    try {
      await this.socket.sendMessage(this.sourceGroupJid, { text: summaryMessage });
    } catch (error) {
      logger.error({ err: error }, 'Failed to send summary message');
    }
  }
}
