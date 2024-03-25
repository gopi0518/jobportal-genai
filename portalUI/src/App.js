import './index.css';
import {useState, useEffect} from "react";
import Chatbot from 'react-chatbot-kit'
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import config from './config';
import { BrowserRouter as Router, Switch, Route,BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar"
import alanBtn from '@alan-ai/alan-sdk-web'
import Jobseeker from "./Jobseeker"
import Recruiter from "./Recruiter"
import UserContext from './user-context';

function App() {
const [value, setValue] = useState("Tim");
const [showBot, toggleBot] = useState(false);
const handleChange = async(event) => {
setValue(event.target.value);
};
  return (
    <UserContext.Provider value={{ name: value }}>
    <div>
    <br/>
    <label> &nbsp; Login:
         <select value={value} onChange={handleChange}>
              <option value="John">John</option>
               <option value="Gopi">Gopi</option>
                <option value="Tim">Tim</option>
          </select>
          <br/>
          <br/>
       <span class="label info">&nbsp; Welcome: {value}</span>
    </label>
       <Router>
      <Navbar />
      <Switch>
        <Route path='/' exact component={Jobseeker} />
        <Route path='/Recruiter' component={Recruiter} />
        <Route path='/Jobseeker' component={Jobseeker} />
      </Switch>
    </Router>

    <div className="app-chatbot-container">
        {showBot && (
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        )}
      </div>
      <button
        className="app-chatbot-button"
        onClick={() => toggleBot((prev) => !prev)}
      >
        <div>Bot</div>
        <svg viewBox="0 0 640 512" className="app-chatbot-button-icon">
          <path d="M192,408h64V360H192ZM576,192H544a95.99975,95.99975,0,0,0-96-96H344V24a24,24,0,0,0-48,0V96H192a95.99975,95.99975,0,0,0-96,96H64a47.99987,47.99987,0,0,0-48,48V368a47.99987,47.99987,0,0,0,48,48H96a95.99975,95.99975,0,0,0,96,96H448a95.99975,95.99975,0,0,0,96-96h32a47.99987,47.99987,0,0,0,48-48V240A47.99987,47.99987,0,0,0,576,192ZM96,368H64V240H96Zm400,48a48.14061,48.14061,0,0,1-48,48H192a48.14061,48.14061,0,0,1-48-48V192a47.99987,47.99987,0,0,1,48-48H448a47.99987,47.99987,0,0,1,48,48Zm80-48H544V240h32ZM240,208a48,48,0,1,0,48,48A47.99612,47.99612,0,0,0,240,208Zm160,0a48,48,0,1,0,48,48A47.99612,47.99612,0,0,0,400,208ZM384,408h64V360H384Zm-96,0h64V360H288Z"></path>
        </svg>
      </button>
    </div>


</UserContext.Provider>
  );
}

export default App;