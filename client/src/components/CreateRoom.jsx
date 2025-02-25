import {useContext, useEffect, useState} from 'react';
import socket from '../socket';
import {appContext} from '../App';
import {useNavigate} from 'react-router-dom'; //ניווט בין דפים

export default function CreateRoom() {
  const [un, setUn] = useState(''); //שם משתמש
  const [rn, setRn] = useState(''); //שם חדר
  const [password, setPassword] = useState(''); // 🔐 משתנה לניהול סיסמה
  const [clr, setClr] = useState('#000000'); // צבע ברירת מחדל (שחור)
  const [error, setError] = useState(''); //שגיאה

  const {loadRoom, inRoom} = useContext(appContext); //טעינת חדר
  const navigate = useNavigate();

  // אם המשתמש כבר בחדר, נווט אותו לחדר
  useEffect(() => {
    if (inRoom) navigate('/room'); //ניווט לחדר
  }, [inRoom, navigate]); //הצגת חדר

  // פונקציה ליצירת חדר
  const create = () => {
    // בדיקת שדות חובה
    if (!un || !rn) {
      setError('Please fill in all required fields.');
      return;
    }

    // שליחת בקשה לשרת עם הסיסמה
    socket.emit('createRoom', rn, password, un, clr, (data) => {
      if (data.error) {
        setError(data.error); // הצגת שגיאה אם חזרה מהשרת
      } else {
        loadRoom(data); // טעינת החדר באפליקציה
      }
    });
  };

  return (
    <div className="form-container">
      <h1>Create A Room</h1>
      <div className="form">
        {error && <p style={{color: 'red'}}>{error}</p>} {/* הצגת הודעת שגיאה */}
        <label>
          User Name:
          <input
            type="text"
            onChange={(e) => setUn(e.target.value)}
            value={un}
            placeholder="Enter your username"
          />
        </label>
        <br />
        <label>
          Display color:
          <input type="color" onChange={(e) => setClr(e.target.value)} value={clr} />
        </label>
        <br />
        <label>
          Room Name:
          <input
            type="text"
            onChange={(e) => setRn(e.target.value)}
            value={rn}
            placeholder="Enter room name"
          />
        </label>
        <br />
        <label>
          Room Password:
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter room password"
          />
        </label>
        <br />
        <button className="room-buttons" onClick={create}>
          Create!
        </button>
      </div>
    </div>
  );
}
