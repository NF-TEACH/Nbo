import { getContentType } from '@whiskeysockets/baileys';

const MAX_PREVIEW_LENGTH = 120;

const trimPreview = (text) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > MAX_PREVIEW_LENGTH ? `${clean.slice(0, MAX_PREVIEW_LENGTH)}…` : clean;
};

export const describeMessage = (message) => {
  const content = message.message;
  if (!content) {
    return { kind: 'unknown' };
  }

  const messageType = getContentType(content);
  if (!messageType) {
    return { kind: 'unknown' };
  }

  switch (messageType) {
    case 'conversation':
    case 'extendedTextMessage': {
      const text = content.conversation ?? content.extendedTextMessage?.text ?? '';
      return {
        kind: 'טקסט',
        preview: trimPreview(text)
      };
    }
    case 'imageMessage': {
      return {
        kind: 'תמונה',
        preview: trimPreview(content.imageMessage?.caption ?? '')
      };
    }
    case 'videoMessage': {
      return {
        kind: 'וידאו',
        preview: trimPreview(content.videoMessage?.caption ?? '')
      };
    }
    case 'audioMessage':
      return { kind: 'אודיו' };
    case 'documentMessage':
      return {
        kind: 'מסמך',
        preview: content.documentMessage?.fileName
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
