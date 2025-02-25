import {useContext, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {appContext} from '../App';

export default function Home() {
  const {inRoom} = useContext(appContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (inRoom) navigate('/room');
  }, [inRoom, navigate]);

  return (
    <div className="home-container">
      <h1>My Chat App</h1>
      <h3>Welcome to the best chat experience!</h3>
      <div className="home-buttons">
        <Link to="/create" className="button">
          Create Room
        </Link>
        <Link to="/join" className="button">
          Join Room
        </Link>
      </div>
    </div>
  );
}
