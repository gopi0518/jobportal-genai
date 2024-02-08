import React,{useState,useEffect,useRef} from 'react'
import alanBtn from '@alan-ai/alan-sdk-web'
// Import the main component
import { Viewer } from '@react-pdf-viewer/core'; // install this library
// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'; // install this library
// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// Worker
import { Worker } from '@react-pdf-viewer/core'; // install this library
import UploadService from "./upload-files.service";
import http from "./http-common";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export const Recruiter = () => {
  const response="";
  const logins = [
  'John', 'Nancy', 'Julie'
];
  const [state, setState] = useState({
    progress: 0,
    message: "",
    selectedFiles: undefined,

  });
  //alan ai calls
  const[profiles, setProfiles] = useState([])
  const[menuItems, setMenuItems] = useState([])
  const alanBtnRef = useRef({}).current;
  let values = ["pasta", "burger", "quesadilla"]
  const [value, setValue] = React.useState('fruit');
  useEffect(() => {
    alanBtnRef.btnInstance = alanBtn({
      key:
        "c897e9154ae01a2f35b977ff00fbcca32e956eca572e1d8b807a3e2338fdd0dc/stage",
      onCommand: (commandData) => {
         console.log(commandData)
         //if(commandData.command === 'getProfiles') {
         console.log(commandData)
         setProfiles(commandData.jobslist)
         //}
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
}, [])
  return (
    <div className='container'>
    <br></br>
{/*<div className="row">
  <div className="column3">
    <h4 align="center">Job Posting</h4>
    <h5 align="center">JobList</h5>
    <div>{responsedata.job_titles}</div>
  </div>
</div>*/}
<div>

    {profiles.length > 0 && <h2>Profiles:</h2>}
    <div className="row">
    {profiles.map(profile => (
    //<li key={menuItem.id}>{menuItem.location} - {menuItem.skills}
    //</li>
    <div className="columncard">
    <Card style={{ width: '15rem' }} key={profile.id}>
      <Card.Body>
        <Card.Title>{profile.id}</Card.Title>
        <Card.Text>
          {profile.location} - {profile.skills}
        </Card.Text>
        <Button variant="primary">View Profile</Button>
      </Card.Body>
    </Card>
    </div>
    ))}
    </div>

    </div>
    {/*<div>
      <button onClick={() => {
        alanBtn.btnInstance.setVisualState({ data: values });
      }}>Send visual state</button>
    </div>*/}
    </div>
  )

}

export default Recruiter
