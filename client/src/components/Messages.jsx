import {useEffect, useState} from 'react';
import socket from '../socket';

// פונקציה לעיצוב התאריך והשעה בפורמט מורחב.
// אם רוצים רק שעה:דקות, אפשר להחליף בתוכן getHours ו-getMinutes בלבד.
const formatDate = (dateString) => {
  const now = new Date(dateString);
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().padStart(4, '0');

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // מבקשים מהשרת את היסטוריית ההודעות
    socket.emit('getMessages', (history) => {
      // נשמור את הזמן המקורי שמגיע מהשרת (msg.at) בפורמט שלנו
      const msgHistory = history.map((msg) => ({
        ...msg,
        time: formatDate(msg.at), // עיצוב לפי הפורמט שרוצים
      }));
      setMessages(msgHistory);
    });

    // מאזינים להודעות חדשות
    const addMsg = (message) => {
      // נקבל את הזמן המקורי מהשרת (message.at) ונעצב
      const messageWithTimestamp = {
        ...message,
        time: formatDate(message.at),
      };
      setMessages((old) => [...old, messageWithTimestamp]);
    };

    // ברגע שמגיעה הודעה חדשה מהשרת
    socket.on('message', addMsg);

    // הסרה (cleanup) בזמן ניתוק
    return () => {
      socket.off('message', addMsg);
    };
  }, []);

  return (
    <div className="messages">
      {messages.map((x, i) => (
        <p key={i}>
          <span style={{color: x.color}}>{x.sender}</span>: {x.content}
          <div style={{textAlign: 'left'}}>
            <span style={{fontSize: '0.7em', color: 'rgb(138, 136, 14)'}}>({x.time})</span>
          </div>
        </p>
      ))}
    </div>
  );
}
