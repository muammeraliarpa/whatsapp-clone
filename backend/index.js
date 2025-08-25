const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB'ye başarıyla bağlandı.");
}).catch(err => {
  console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

wss.on('connection', ws => {
  console.log('Yeni istemci bağlandı!');

  Message.find().sort({ timestamp: 1 }).then(messages => {
    messages.forEach(msg => {
      ws.send(JSON.stringify(msg));
    });
  }).catch(err => {
    console.error("Mesajlar yüklenirken hata:", err);
  });

  ws.on('message', async message => {
    try {
      const data = JSON.parse(message);
      console.log(`Alınan mesaj: ${data.text}`);

      const newMessage = new Message({
        username: data.username,
        text: data.text
      });
      await newMessage.save();

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(newMessage));
        }
      });
    } catch (e) {
      console.error("Mesaj işlenirken hata oluştu:", e);
    }
  });

  ws.on('close', () => {
    console.log('İstemci bağlantısı kapandı.');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend ${PORT} portunda dinliyor...`);
});
