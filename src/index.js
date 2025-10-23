import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import config from './config.js';
import logger from './utils/logger.js';
import { MessageForwarder } from './forwarding/messageForwarder.js';
import { SummaryReporter } from './messages/summaryReporter.js';
import { describeMessage } from './messages/messageDescriptor.js';

const AUTH_FOLDER = 'auth';

const shouldHandleMessage = (message, forwarder) => {
  if (!message.message) {
    return false;
  }

  if (message.key.fromMe) {
    return false;
  }

  if (message.key.remoteJid === 'status@broadcast') {
    return false;
  }

  return forwarder.isSourceGroup(message.key.remoteJid);
};

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    version,
    printQRInTerminal: true,
    logger
  });

  const forwarder = new MessageForwarder(socket);
  const reporter = new SummaryReporter(socket, config.sourceGroupJid);

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn({ shouldReconnect, statusCode }, 'Connection closed');

      if (shouldReconnect) {
        start().catch((err) => logger.error({ err }, 'Failed to restart Synbo bot'));
      } else {
        logger.error('Synbo bot logged out. Delete the auth folder to reauthenticate.');
      }
    } else if (connection === 'open') {
      logger.info('Synbo bot connected to WhatsApp');
    }
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') {
      return;
    }

    for (const message of messages) {
      if (!shouldHandleMessage(message, forwarder)) {
        continue;
      }

      logger.info({ messageId: message.key.id }, 'Forwarding incoming message');

      try {
        const results = await forwarder.forward(message);
        const descriptor = describeMessage(message);
        await reporter.sendSummary(descriptor, results);
      } catch (error) {
        logger.error({ err: error }, 'Failed to process incoming message');
      }
    }
  });
};

start().catch((error) => {
  logger.error({ err: error }, 'Failed to initialize Synbo bot');
  process.exit(1);
});
