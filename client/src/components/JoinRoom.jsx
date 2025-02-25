import {useContext, useState, useEffect} from 'react'; //USE EFFECT פונקצית ריענון על פי שינויים
import socket from '../socket';
import {appContext} from '../App';
import {Navigate, useSearchParams} from 'react-router-dom';

export default function JoinRoom() {
  //יצירת קומפוננטת הצטרפות לחדר
  const [un, setUn] = useState(''); //יצירת משתנה חדש בשם un והצבת ערך ברירת מחדל שלו הוא ריק
  const [clr, setClr] = useState(''); //יצירת משתנה חדש בשם clr והצבת ערך ברירת מחדל שלו הוא ריק
  const [rId, setRId] = useState(''); //יצירת משתנה חדש בשם rId והצבת ערך ברירת מחדל שלו הוא ריק
  const [password, setPassword] = useState(''); //יצירת משתנה חדש בשם password והצבת ערך ברירת מחדל שלו הוא ריק
  const [error, setError] = useState(''); //יצירת משתנה חדש בשם error והצבת ערך ברירת מחדל שלו הוא ריק

  const {loadRoom, inRoom} = useContext(appContext); //הכנסת ערכים מהמשתנה הגלובלי למשתנים מקומיים
  const [searchParams] = useSearchParams(); //הכנסת ערכים מהכתובת למשתנים מקומיים

  useEffect(() => {
    //פונקצית ריענון על פי שינויים
    const roomIdFromUrl = searchParams.get('id'); //הצגת ערך מהכתובת
    const roomPswFromUrl = searchParams.get('psw'); //הצגת ערך מהכתובת

    setRId(roomIdFromUrl); //הצבת ערך במשתנה
    setPassword(roomPswFromUrl); //הצבת ערך במשתנה
  }, [searchParams]); //הפעלת פונקצית ריענון על פי שינויים במשתנים searchParams

  const create = () => {
    //פונקצית יצירת חדר
    socket.emit('joinRoom', rId, password, un, clr, (data) => {
      //emit שליחת בקשה לשרת עם הפרמטרים
      //שליחת פרטי החדר לסוקט
      if (data.error) return setError(data.error); //הצגת הודעת שגיאה
      loadRoom(data); //טעינת חדר
    });
  };

  if (inRoom) return <Navigate to="/room" />; //הצגת חדר

  return (
    <div className="form-container">
      <h1>Join A Room</h1>
      <div className="form">
        <label>
          User Name:
          <input type="text" onChange={(e) => setUn(e.target.value)} value={un} />
        </label>
        <br />
        <label>
          Display color:
          <input type="color" onChange={(e) => setClr(e.target.value)} value={clr} />
        </label>
        <br />
        <label>
          Room Id:
          <input type="text" onChange={(e) => setRId(e.target.value)} value={rId} />
        </label>
        <br />
        <label>
          Room Password:
          <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
        </label>

        <br />
        <button className="join-button" onClick={create}>
          Join!
        </button>
        <br />
        {error && <p className="error">*error: {error}</p>}
      </div>
    </div>
  );
}
