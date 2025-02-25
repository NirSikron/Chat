import http from 'http'; //ספריית HTTP מובנית בספריית Node.js שמאפשרת לנו לבנות שרתים ולקבל בקשות ולשלוח תשובות
import express from 'express'; //מאפשר טיפול בבקשות של middleware וכן יכולת ליצור שרתים
import cors from 'cors'; //cors היא ספריה שמטרתה לאפשר לשרת לקבל בקשות ממקורות שונים
import {Server} from 'socket.io'; //Socket הוא ערוץ תקשורת דו-כיווני בזמן אמת בין לקוח לשרת.
import Room from './room.js'; //קריאה למודול של החדר

const app = express(); //יצירת אובייקט של האפליקציה
const server = http.createServer(app); //יצירת שרת על בסיס האפליקציה
const io = new Server(server, {
  //io היא ספריה שמאפשרת לנו לבנות שרתים ולקבל בקשות ולשלוח תשובות בזמת אמת
  cors: {
    origin: 'http://localhost:5173', //הגבלת גישה לכתובת מסוימת
    methods: ['POST', 'GET', 'PUT'], //הגבלת שימוש בסוגי בקשות
  }, //GET – בקשת נתונים (לדוגמה, קבלת רשימת משתמשים).
  //POST – שליחת נתונים (לדוגמה, יצירת משתמש חדש).
  //PUT – עדכון נתונים (לדוגמה, שינוי פרטי משתמש).
});

app.use(cors({origin: 'http://localhost:5173'})); //הגבלת גישה לכתובת מסוימת

// פונקציה לבניית אובייקט הודעה
const buildMessage = (content, sender, color, server) => ({
  content, //תוכן ההודעה
  color,
  isServer: server, //האם ההודעה מהשרת
  sender,
  at: new Date(),
});

// אובייקטים לניהול חדרים ומשתמשים
const rooms = {}; //מילון של חדרים בשונה ממערך כי כאן נשמור על החדרים לפי המפתח שלהם
const users = {}; //מילון של משתמשים בשונה מ מערך כי כאן נשמור על המשתמשים לפי המפתח שלהם

io.on('connection', (socket) => {
  //פונקציה המטפלת בחיבור של משתמש חדש
  console.log(`Client connected: ${socket.id}`);

  // יצירת חדר
  socket.on('createRoom', (roomName, password, userName, color, cb) => {
    if (rooms[roomName]) {
      //בדיקה אם החדר קיים
      return cb({error: 'Room already exists!'});
    }

    // יצירת אובייקט Room חדש ושמירתו ברשימת החדרים
    const room = new Room(roomName, password);
    const user = {userName, color, roomId: room.id}; //יצירת משתמש חדש

    users[socket.id] = user; //שמירת המשתמש במערך
    room.addUser(user);
    rooms[room.id] = room;

    socket.join(room.id); //הצטרפות לחדר

    console.log(`Room created: ${roomName} (password: ${password})`);
    cb({
      members: room.users,
      roomName: room.name,
      roomId: room.id,
      password: room.password,
    });
  });

  // הצטרפות לחדר
  socket.on('joinRoom', (roomId, password, userName, color, cb) => {
    //CB של הסיסמה חשוב בלעדיו הסיסמה לא נשמרת כראוי
    const room = rooms[roomId];
    if (!room) {
      return cb({error: 'Room not found!'});
    }

    // בדיקת סיסמה (אם קיימת סיסמה)
    if (room.password && !room.isPasswordCorrect(password)) {
      return cb({error: 'Incorrect password!'});
    }

    const user = {userName, color, roomId: room.id};
    room.addUser(user);
    users[socket.id] = user;

    socket.join(room.id);
    socket.to(room.id).emit('memberUpdate', room.users);

    socket
      .to(roomId)
      .emit('message', buildMessage(`${userName} has joined the room`, 'Server', '', true));
    //ב-Socket.IO, emit היא פונקציה שמשמשת לשליחת אירועים (Events) עם נתונים בין השרת ללקוח, או בין לקוח לשרת.
    // שליחת היסטוריית ההודעות למשתמש שהצטרף
    cb({
      members: room.users,
      roomName: room.name,
      roomId: room.id,
      messages: room.messages,
    });
  });

  // בקשת היסטוריית הודעות
  socket.on('getMessages', (cb) => {
    const user = users[socket.id];
    if (!user) return cb([]);

    const room = rooms[user.roomId];
    if (!room) return cb([]);

    cb(room.messages);
  });

  // שליחת הודעה בצ'אט
  socket.on('chat', (message) => {
    const user = users[socket.id];
    if (!user) return;

    const msg = buildMessage(message, user.userName, user.color, false);
    rooms[user.roomId].messages.push(msg);

    io.in(user.roomId).emit('message', msg);
  });

  // התנתקות משתמש
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const room = rooms[user.roomId];
      if (room) {
        room.removeUser(user);
        socket.to(room.id).emit('memberUpdate', room.users);
        socket
          .to(room.id)
          .emit('message', buildMessage(`${user.userName} has left the room`, 'Server', '', true));
      }
      delete users[socket.id];
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// נתיבי API
app.get('/count/rooms/api/', (req, res) => {
  //פונקציה שמחזירה את מספר החדרים
  const count = Object.keys(rooms).length;
  res.json({data: count});
});

app.get('/rooms/api/', (req, res) => {
  //פונקציה שמחזירה את שמות החדרים
  const roomNames = Object.values(rooms).map((room) => room.name);
  res.json({data: roomNames});
});

app.get('/count/users/api/', (req, res) => {
  //פונקציה שמחזירה את מספר המשתמשים
  const userCount = Object.values(rooms).reduce((count, room) => count + room.users.length, 0);
  res.json({data: userCount});
});

server.listen(3000, () => {
  //הפעלת השרת
  console.log('Server listening on port 3000');
});
