import {useState} from 'react';
import socket from '../socket';

export default function SendMessage() {
  //יצירת קומפוננטת שליחת הודעה
  const [msg, setMsg] = useState(''); //יצירת משתנה חדש בשם msg והצבת ערך ברירת מחדל שלו הוא ריק
  const send = () => {
    //פונקצית שליחת הודעה
    if (!msg.trim()) return; //אם ההודעה ריקה תחזור

    socket.emit('chat', msg); //שליחת הודעה לסוקט
    setMsg(''); //הצבת ערך ריק במשתנה
  };
  const keyDown = (e) => {
    if (e.key === 'Enter') send(); //אם הקלט הוא ENTER תשלח את ההודעה
  };
  return (
    <div className="send-form">
      <input type="text" onChange={(e) => setMsg(e.target.value)} value={msg} onKeyDown={keyDown} />
      <button onClick={send}>Send</button>
    </div>
  );
}
