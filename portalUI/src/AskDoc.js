import React,{useState,useEffect,useRef,useContext} from 'react'
import alanBtn from '@alan-ai/alan-sdk-web'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UserContext from './user-context';
// Import the main component
import { Viewer } from '@react-pdf-viewer/core'; // install this library
// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'; // install this library
// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// Worker
import { Worker } from '@react-pdf-viewer/core'; // install this library
import ControllerService from "./controllerService";
import http from "./http-common";

export const AskDoc = () => {
const user = useContext(UserContext);
  console.log(user.name+"hello");
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
  let loginval=user.name;
  //alan ai calls
  const[jobs, setJobs] = useState([])
  const alanBtnRef = useRef({}).current;
  const[menuItems, setMenuItems] = useState([])
  const[value, setValue] = useState([])
  const handlePdfFileChange=(e)=>{
    let selectedFile=e.target.files[0];
    let url="/jobportal/uploaddoc?userid="+loginval;
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

     ControllerService.upload(url,selectedFile,loginval, (event) => {
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
{/*
      <label>

       Login as:

       <select value={value} onChange={handleChange}>

         <option value="John">John</option>

         <option value="Gopi">Gopi</option>

         <option value="Tim">Tim</option>

       </select>

     </label>

     <p>Welcome {value}!</p> */}
      <form className='form-group' onSubmit={handlePdfFileSubmit}>

        <input type="file" className='form-control'
          required onChange={handlePdfFileChange}
        />
        {pdfFileError&&<div className='error-msg'>{pdfFileError}</div>}
        <br></br>
        <button type="submit" className='btn btn-success btn-sm'>
          UPLOAD DOC
        </button>
      </form>
{viewPdf&&<><div>
  <div className="column1">
     {/* show pdf conditionally (if we have one)  */}
        {viewPdf&&<><Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
          <Viewer fileUrl={viewPdf}
            plugins={[defaultLayoutPluginInstance]} />
      </Worker></>}

      {/* if we dont have pdf or viewPdf state is null */}
      {!viewPdf&&<>No resume selected</>}
  </div>
</div></>}

    </div>

  )

}

export default AskDoc;
