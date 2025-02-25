import {useContext, useState} from 'react';
import {appContext} from '../App';
import {Link, Navigate} from 'react-router-dom';
import Messages from './Messages';
import SendMessage from './SendMessage';

export default function Room() {
  //comst ערך שמור לא ישתנה
  const {inRoom, room, setInRoom} = useContext(appContext);
  const [copySuccess, setCopySuccess] = useState(false); // ✅ מצב להודעת העתקה

  if (!inRoom) return <Navigate to="/" />;

  //  פונקציה להעתקת קישור ההזמנה
  const copyInvite = () => {
    const url = `${window.location.origin}/join?id=${room.roomId}&psw=${room.password}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // מחיקת ההודעה לאחר 2 שניות
      })
      .catch((err) => console.error('Failed to copy:', err));
  };

  return (
    <div className="room">
      {/* שם החדר */}
      <div className="chat-header">
        <h1>Room: {room.roomName}</h1>
      </div>

      <div className="room-content">
        <div className="left">
          <h2>Room Members</h2>
          <ul className="members-list">
            {room.members.map((m, i) => (
              <li style={{color: m.color}} key={i}>
                {m.userName}
              </li>
            ))}
          </ul>

          {/* ✅ כפתור העתקה עם הודעת אישור */}
          <button onClick={copyInvite} className="room-buttons">
            Copy Invite
          </button>
          {copySuccess && <p className="copy-message">Invite link copied!</p>}

          <Link to="/" onClick={() => setInRoom(false)}>
            <button className="room-buttons">Logout</button>
          </Link>
        </div>

        {/* מרכז - הצ'אט */}
        <div className="center">
          <div className="chat-box">
            <Messages />
          </div>
          <SendMessage />
        </div>
      </div>
    </div>
  );
}
