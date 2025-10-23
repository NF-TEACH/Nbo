import { getContentType, WAMessage } from '@adiwajshing/baileys';

export interface MessageDescriptor {
  kind: string;
  preview?: string;
}

const MAX_PREVIEW_LENGTH = 120;

const trimPreview = (text: string): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > MAX_PREVIEW_LENGTH ? `${clean.slice(0, MAX_PREVIEW_LENGTH)}…` : clean;
};

export const describeMessage = (message: WAMessage): MessageDescriptor => {
  const messageType = getContentType(message.message!);
  if (!messageType) {
    return { kind: 'unknown' };
  }

  switch (messageType) {
    case 'conversation':
    case 'extendedTextMessage': {
      const text = message.message?.conversation ?? message.message?.extendedTextMessage?.text ?? '';
      return {
        kind: 'טקסט',
        preview: trimPreview(text)
      };
    }
    case 'imageMessage': {
      return {
        kind: 'תמונה',
        preview: trimPreview(message.message?.imageMessage?.caption ?? '')
      };
    }
    case 'videoMessage': {
      return {
        kind: 'וידאו',
        preview: trimPreview(message.message?.videoMessage?.caption ?? '')
      };
    }
    case 'audioMessage':
      return { kind: 'אודיו' };
    case 'documentMessage':
      return {
        kind: 'מסמך',
        preview: message.message?.documentMessage?.fileName
      };
    case 'stickerMessage':
      return { kind: 'סטיקר' };
    case 'contactMessage':
      return { kind: 'איש קשר' };
    case 'contactsArrayMessage':
      return { kind: 'רשימת אנשי קשר' };
    case 'locationMessage':
      return { kind: 'מיקום' };
    case 'liveLocationMessage':
      return { kind: 'מיקום חי' };
    case 'buttonsMessage':
      return { kind: 'כפתורים' };
    case 'listMessage':
      return { kind: 'רשימת בחירה' };
    case 'templateMessage':
      return { kind: 'תבנית' };
    default:
      return { kind: messageType };
  }
};
