import {nanoid} from 'nanoid'; //מחלקת NANO ID מחוללת כתובות ID

export default class Room {
  constructor(name, password = '') {
    this.id = nanoid(); //מייצגת כתובת ID ייחודית
    this.users = []; //מערך של משתמשים
    this.name = name; //שם החדר
    this.password = password; // סיסמה לחדר
    this.messages = []; // מערך של הודעות
  }

  addUser(user) {
    //הוספת משתמש לחדר
    this.users.push(user); //הוספת משתמש למערך
  }

  removeUser(user) {
    //מחיקת משתמש מהחדר
    this.users = this.users.filter((u) => u.userName !== user.userName); //מחיקת משתמש מהמערך
  }

  isPasswordCorrect(password) {
    //בדיקת סיסמה
    return this.password === password; //החזרת תוצאה אם הסיסמה נכונה
  }
  addMessage(message) {
    //הסטוריה של הודעות
    //הוספת הודעה לחדר
    this.messages.push(message); //הוספת הודעה למערך
  }
}
