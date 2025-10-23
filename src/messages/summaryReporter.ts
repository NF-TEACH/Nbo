import { WASocket } from '@adiwajshing/baileys';
import logger from '../utils/logger';
import { MessageDescriptor } from './messageDescriptor';

export interface ForwardResult {
  jid: string;
  success: boolean;
  error?: string;
}

const formatGroupList = (jids: string[]): string =>
  jids.map((jid) => jid.replace(/@g\.us$/, '')).join(', ');

export class SummaryReporter {
  constructor(private readonly socket: WASocket, private readonly sourceGroupJid: string) {}

  async sendSummary(descriptor: MessageDescriptor, results: ForwardResult[]): Promise<void> {
    const successful = results.filter((result) => result.success).map((result) => result.jid);
    const failed = results.filter((result) => !result.success);

    const lines: string[] = [];

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
