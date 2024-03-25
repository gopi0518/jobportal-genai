import React,{useContext} from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import Postresume from "./Postresume";
import Recruiter from "./Recruiter";
import PortalChatbot from "./PortalChatbot";
import ProfileSummary from "./ProfileSummary";
import Viewjobs from "./Viewjobs";
import UserContext from './user-context';
const VerticalTab = ({ label, to }) => (
  <Link to={to} className="tab">
    {label}
  </Link>
);

<<<<<<< HEAD
const Jobseeker = () => {
  //const { username } = useContext(UserContext);
  //console.log(user.name);
=======
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

export const Jobseeker = () => {
  const response="";
  const [state, setState] = useState({
    progress: 0,
    message: "",
    selectedFiles: undefined,
  });
  // Create new plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  // for onchange event
  const [pdfFile, setPdfFile]=useState(null);
  const [pdfFileError, setPdfFileError]=useState('');
  const [responsedata, setResponseData]=useState('');
  // for submit event
  const [viewPdf, setViewPdf]=useState(null);

  // onchange event
  const fileType=['application/pdf'];
  let values = ["pasta", "burger", "quesadilla"]
  let loginval="Gopi"
  //alan ai calls
  const[jobs, setJobs] = useState([])
  const alanBtnRef = useRef({}).current;
  const[menuItems, setMenuItems] = useState([])
  const[value, setValue] = useState([])

 const handleChange = (event) => {

   setValue(event.target.value);
   loginval=event.target.value;

 };
  useEffect(() => {
    alanBtnRef.btnInstance = alanBtn({
      key:
        "ssssss/stage",
      onCommand: (commandData) => {
         console.log(commandData)
         //if(commandData.command === 'getProfiles') {
         console.log(commandData)
         setJobs(commandData.jobslist)
         //}
      },
      onConnectionStatus: (status) => {
      if (status === 'authorized') {
        alanBtnRef.btnInstance.callProjectApi("sendGreetingMessage",{data:{role:"jobseeker",user:loginval}});
      }
    },
      onEvent: function (e) {
    console.info('onEvent', e);
  },
    })
}, [])
  const handlePdfFileChange=(e)=>{
    let selectedFile=e.target.files[0];
    let url="/resume/upload?userid="+loginval;
    if(selectedFile){
      if(selectedFile&&fileType.includes(selectedFile.type)){
        let reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onloadend = (e) =>{
              setPdfFile(e.target.result);
              setPdfFileError('');
            }
      }
      else{
        setPdfFile(null);
        setPdfFileError('Please select valid pdf file');
      }

     UploadService.upload(url,selectedFile,loginval, (event) => {
     setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
     })
      .then((response) => {
        setResponseData(response.data);
        console.log(response.data)
      })
      .catch(() => {
        setState({
          progress: 0,
          message: "Could not upload the file!",
          currentFile: undefined,
        });
      });

    /*let formData = new FormData();

    formData.append("file", selectedFile);

    const response = http.post("/resume/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }).then((response) => {
        response=response.data
        console.log(response)
      });*/
    }
    else{
      console.log('select your file');
    }
  }

  // form submit
  const handlePdfFileSubmit=(e)=>{
    e.preventDefault();
    if(pdfFile!==null){
      setViewPdf(pdfFile);
    }
    else{
      setViewPdf(null);
    }
  }
>>>>>>> 2f03636f1b50b82a14ae0888746ad6105dfcacfe
  return (

    <div className="vertical-tabs">

      <Router>
        <div className="tab-list">
          <VerticalTab label="Post your resume" to="/Postresume" />
          <VerticalTab label="View Jobs" to="/Viewjobs" />
          <VerticalTab label="Profile Summary" to="/ProfileSummary" />
          {/*<VerticalTab label="Portal Chatbot" to="/PortalChatbot" />*/}
        </div>
        <div className="tab-content">
          <Switch>
            <Route path="/Postresume" component={Postresume} />
            <Route path="/ViewJobs" component={Viewjobs} />
            <Route path="/ProfileSummary" component={ProfileSummary} />
            {/*<Route path="/PortalChatbot" component={PortalChatbot} />*/}
          </Switch>
        </div>
      </Router>
    </div>

  );
};

export default Jobseeker;
