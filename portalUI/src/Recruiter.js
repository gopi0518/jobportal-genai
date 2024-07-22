import React,{useState} from 'react'
//import alanBtn from '@alan-ai/alan-sdk-web'
// Import the main component
// Worker
//import { Worker } from '@react-pdf-viewer/core'; // install this library
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import Postjob from "./Postjob";
import ViewProfiles from "./ViewProfiles";
//import { useLocation } from 'react-router-dom';
//import PortalChatbot from "./PortalChatbot";

const VerticalTab = ({ label, to }) => (
  <Link to={to} className="tab">
    {label}
  </Link>
);
export const Recruiter = () => {
  const [state, setState] = useState({
    progress: 0,
    message: "",
    selectedFiles: undefined,

  });
  //alan ai calls
  const[profiles, setProfiles] = useState([])
  {/*useEffect(() => {
    alanBtnRef.btnInstance = alanBtn({
      key:
        "c897e9154ae01a2f35b977ff00fbcca32e956eca572e1d8b807a3e2338fdd0dc/stage",
      onCommand: (commandData) => {
         console.log(commandData)
         if(commandData.command === 'getProfiles') {
         console.log(commandData)
         setProfiles(commandData.data)
         }
      },
      onConnectionStatus: (status) => {
      if (status === 'authorized') {
        alanBtnRef.btnInstance.callProjectApi("sendGreetingMessage",{data:{role:"recruiter",user:"recruiter1"}});
      }
    },
      onEvent: function (e) {
      console.info('onEvent', e.text);
  },
    })
}, [])*/}
  return (

    <div className="vertical-job-tabs">
      <Router>
        <div className="tab-list">
          <VerticalTab label="Upload Job Posting" to="/Postjob" />
          <VerticalTab label="Create Job Posting AI" to="/Postjob" />
          <VerticalTab label="View Profiles" to="/ViewProfiles" />
          {/*<VerticalTab label="Portal Chatbot" to="/PortalChatbot" />*/}
        </div>
        <div className="tab-content">
          <Switch>
            <Route path="/" exact component={ViewProfiles} />
            <Route path="/ViewProfiles" component={ViewProfiles} />
            <Route path="/Postjob" component={Postjob} />
            {/*<Route path="/PortalChatbot" component={PortalChatbot} />*/}
          </Switch>
        </div>
      </Router>

    </div>

  );

}

export default Recruiter
