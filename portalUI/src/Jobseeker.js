import React,{useState,useEffect,useRef} from 'react'
import alanBtn from '@alan-ai/alan-sdk-web'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
  return (
    <div className='container'>
     <br></br>

      <label>

       Login as:

       <select value={value} onChange={handleChange}>

         <option value="John">John</option>

         <option value="Gopi">Gopi</option>

         <option value="Tim">Tim</option>

       </select>

     </label>

     <p>Welcome {value}!</p>
      <form className='form-group' onSubmit={handlePdfFileSubmit}>

        <input type="file" className='form-control'
          required onChange={handlePdfFileChange}
        />
        {pdfFileError&&<div className='error-msg'>{pdfFileError}</div>}
        <br></br>
        <button type="submit" className='btn btn-success btn-sm'>
          UPLOAD RESUME
        </button>
      </form>
{viewPdf&&<><div className="row">
  <div className="column1">
     {/* show pdf conditionally (if we have one)  */}
        {viewPdf&&<><Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
          <Viewer fileUrl={viewPdf}
            plugins={[defaultLayoutPluginInstance]} />
      </Worker></>}

      {/* if we dont have pdf or viewPdf state is null */}
      {!viewPdf&&<>No resume selected</>}
  </div>
  {responsedata&&<><div className="column2">
  <div className="center">
  <img src="SmallArrow.png"/>
  </div>
  </div></>}
  {responsedata&&<><div className="column3">
    <h4 align="center">Resume Summary</h4>
    <div><h6 align="center">Name: {responsedata.first_name} {responsedata.last_name}</h6></div>
    <div><h6 align="center">Email: {responsedata.email}</h6></div>
    <div><h5 align="center">Technical Skills:</h5>{responsedata.recent_technologies_worked}</div>
    <div><h5 align="center">Recommended Jobs:</h5>{responsedata.recommended_jobs}</div>

  </div></>}
</div></>}
<div>
    {jobs.length > 0 && <h2>Recommended Jobs:</h2>}
    <div className="row">
    {jobs.map(job => (
    //<li key={menuItem.id}>{menuItem.location} - {menuItem.skills}
    //</li>
    <div className="columncard">
    <Card style={{ width: '15rem' }} key={job.id}>
      <Card.Body>
        <Card.Title>{job.id}</Card.Title>
        <Card.Text>
          {job.location} - {job.skills}
        </Card.Text>
        <Button variant="primary">View Job</Button>
      </Card.Body>
    </Card>
    </div>
    ))}
    </div>

    </div>

    </div>

  )

}

export default Jobseeker
