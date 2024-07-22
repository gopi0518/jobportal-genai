import React,{useContext} from 'react';
import UserContext from './user-context';

const WelcomeChatMessage = () => {
const user = useContext(UserContext);
  return (
    <div><p>Hi {user.name}</p></div>
  );
};

export default WelcomeChatMessage;