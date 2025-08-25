const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
// WebSocket sunucusunu belirtilen sunucuya bağla
const wss = new WebSocket.Server({ server });

// MongoDB'ye bağlan
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB'ye başarıyla bağlandı.");
}).catch(err => {
  console.error("MongoDB'ye bağlanırken hata oluştu:", err);
});

// Mesaj şemasını tanımla
const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// WebSocket bağlantısı
wss.on('connection', ws => {
  console.log('Yeni istemci bağlandı!');

  // Mevcut mesajları veritabanından yükle ve gönder
  Message.find().sort({ timestamp: 1 }).then(messages => {
    messages.forEach(msg => {
      ws.send(JSON.stringify(msg));
    });
  }).catch(err => {
    console.error("Mesajlar yüklenirken hata:", err);
  });

  // İstemciden gelen mesajları dinle
  ws.on('message', async message => {
    try {
      const data = JSON.parse(message);
      console.log(`Alınan mesaj: ${data.text}`);

      // Yeni mesajı veritabanına kaydet
      const newMessage = new Message({
        username: data.username,
        text: data.text
      });
      await newMessage.save();

      // Mesajı tüm bağlı istemcilere geri gönder
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
server.listen(PORT, '0.0.0.0', () => { // Buradaki '0.0.0.0' eklemesi, sunucunun tüm ağ arayüzlerini dinlemesini sağlar
  console.log(`Backend ${PORT} portunda dinliyor...`);
});
