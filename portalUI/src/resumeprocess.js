import React,{Component, useState} from 'react';
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
const defaultLayoutPluginInstance = defaultLayoutPlugin();
export default class ResumeProcess extends Component {
  constructor(props) {
    super(props);
    this.selectFile = this.selectFile.bind(this);
    this.upload = this.upload.bind(this);
    this.handlePdfFileSubmit= this.handlePdfFileSubmit.bind(this);
    this.setPdfFile = this.setPdfFile.bind();
    this.setPdfFileError = this.setPdfFileError.bind();

  // for submit event

    this.state = {
      selectedFiles: undefined,
      currentFile: undefined,
      progress: 0,
      message: "",
      viewPef: "",
      fileInfos: [],
      pdfFile: "",

    };
  }

  /*componentDidMount() {
    UploadService.getFiles().then((response) => {
      this.setState({
        fileInfos: response.data,
      });
    });
  }*/


  setPdfFile(event){
  this.setState({
      pdfFile: this.state.selectedFiles[0],
    });
  }
  selectFile(event) {
    this.setState({
      selectedFiles: event.target.files,
    });
  }
  upload() {
    let currentFile = this.state.selectedFiles[0];
    const fileType=['application/pdf'];
    if(currentFile&&fileType.includes(currentFile.type)){
        let reader = new FileReader();
            reader.readAsDataURL(currentFile);
            reader.onloadend = (e) =>{
              this.setPdfFile(e.target.result);
              this.setPdfFileError('');
            }
      }
      else{
        this.setPdfFile(null);
        this.setPdfFileError('Please select valid pdf file');
      }

    this.setState({
      progress: 0,
      currentFile: currentFile,
    });

    UploadService.upload(currentFile, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
      .then((response) => {
        this.setState({
          message: response.data.message,
        });
        //return UploadService.getFiles();
      })
      .then((files) => {
        this.setState({
          fileInfos: files.data,
        });
      })
      .catch(() => {
        this.setState({
          progress: 0,
          message: "Could not upload the file!",
          currentFile: undefined,
        });
      });

    this.setState({
      selectedFiles: undefined,
    });
  }
  render() {
    const {
      selectedFiles,
      currentFile,
      progress,
      message,
      fileInfos,
      pdfFile,
    } = this.state;

    return (
       <div className='container'>
    <div className="container my-3 py-3">
        <h1 className="text-center">Job Portal</h1>
        <h5 className="text-center">Powered by AI</h5>
      </div>
      <form className='form-group' onSubmit={this.upload}>
        <input type="file" className='form-control'
          required onChange={this.handlePdfFileChange}
        />
        {this.pdfFileError&&<div className='error-msg'>{this.pdfFileError}</div>}
        <br></br>
        <button type="submit" className='btn btn-success btn-sm'>
          UPLOAD
        </button>
      </form>
<div className="row">
  <div className="column1">
     {/* show pdf conditionally (if we have one)  */}
        {currentFile&&<><Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
          <Viewer fileUrl={currentFile}
            plugins={[defaultLayoutPluginInstance]} />
      </Worker></>}

      {/* if we dont have pdf or viewPdf state is null */}
      {!currentFile&&<>No pdf file selected</>}
  </div>
  <div className="column2">
  <div className="center">
       <button type="submit" className='btn btn-success btn-sm'>
          Generate<br/ >Summary
        </button>
   </div>
  </div>
  <div className="column3">
    <h4>Resume Summary</h4>
    <div>{message}</div>
  </div>
</div>
    </div>
    );
  }
}
