import {createContext, useEffect, useState} from 'react';
import {Route, Routes} from 'react-router-dom'; //ספריית ראוטר תפקידה לנווט בין הדפים. תפקיד הלינק הוא ליצור קישורים בין הדפים. ספרית הרואטס מאפשרת לנו להגדיר את הנתיבים של האפליקציה ואילו קומפוננטות יוצגו בכל נתיב.
import Home from './components/home';
import Room from './components/Room';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import socket from './socket';

export const appContext = createContext({inRoom: false, room: {}, key: ''}); //INROOM משתנה המשמש לדעת האם משתמש נמצא בחדר או לא, ROOM משתנה המכיל את פרטי החדר, KEY משתנה המשמש לקבלת ערך מהקונטקסט

export default function App() {
  const [inRoom, setInRoom] = useState(false); //יצירת משתנה חדש בשם inRoom והצבת ערך ברירת מחדל שלו הוא false
  const [room, setRoom] = useState({}); //יצירת משתנה חדש בשם room והצבת ערך ברירת מחדל שלו הוא אובייקט ריק

  useEffect(() => {
    //פונקצית ריענון על פי שינויים
    function updateMembers(mem) {
      //פונקצית עדכון חברים
      setRoom((old) => ({...old, members: mem})); //עדכון חברים בחדר
    }
    socket.on('memberUpdate', updateMembers); //הפעלת פונקצית עדכון חברים על פי עדכון חברים בסוקט
    return () => {
      //החזרת פונקצית ריענון
      socket.off('memberUpdate', updateMembers); //כיבוי פונקצית עדכון חברים
    };
  }, [inRoom, setRoom]); //הפעלת פונקצית ריענון על פי שינויים במשתנים inRoom ו-setRoom

  const loadRoom = (room) => {
    //פונקצית טעינת חדר
    setRoom(room); //הצבת חדר
    setInRoom(true); //הצגת חדר
  };

  return (
    <div>
      <appContext.Provider value={{inRoom, room, loadRoom}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </appContext.Provider>
    </div>
  );
} // ✅ סגירת פונקציית App שהייתה חסרה
