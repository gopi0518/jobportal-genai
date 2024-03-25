import React,{useState,useEffect,useContext} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import UserContext from './user-context';
import { MDBCol, MDBFormInline, MDBBtn } from "mdbreact";
import ControllerService from "./controllerService";
const Viewjobs = () =>  {
    const [jobs, setJobList]=useState("");
    const [location, setLocation]=useState("");
    const [recjobs, setRecJobsList]=useState("");
    const [jobdetails, getJobdetails]=useState("");
    const [jobsearchreq, setJobSearchReq] = useState("");
    const user = useContext(UserContext);
    console.log(user.name)
      useEffect(() => {
            const fetchData = async () => {
            const response = await fetch('http://localhost:5000/jobportal/profile?login='+user.name+'&role=jobseeker')
            const data = await response.json();
            console.log(data.items[0].recommended_jobs);
            setLocation(data.items[0].location);
            let recjobs = data.items[0].recommended_jobs.split(",",4);
            setRecJobsList(recjobs)
            console.log(recjobs);
            console.log(data.items[0].location);
        }
        fetchData();
    }, []);

   const viewJobs = (query) => {
    const fetchjobs = async () => {
            const response = await fetch('http://localhost:5000/jobportal/jobs?login='+user.name+'&role=jobseeker',{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"searchquery": query,"location":location})
            }
            )
            const jobs = await response.json();
            //console.log(profiles)
            setJobList(jobs.items);
            console.log(jobs);
        }
        fetchjobs();
   }

   const viewJob = (jobid) => {
    const fetchjob = async () => {
            const response = await fetch('http://localhost:5000/jobportal/jobpost?jobid='+jobid)
            const job = await response.json();
            //console.log(profiles)
            getJobdetails(job.items);
            console.log(job);
        }
        fetchjob();
   }

    return(
    <div>
    <div className="row">
    <input type="text" name="jobserachreq" placeholder="Ex: Solution architect" size="50" value={jobsearchreq} onChange={(e) => {setJobSearchReq(e.target.value)}}/>
    <Button class="btn" onClick={() => viewJobs(jobsearchreq)}>Search</Button>
    </div>
    <br/>
    {recjobs && <div>
    <div>
    <h6>Recommended Jobs:</h6>
    <div className="row">
    {recjobs.map((job, index) => {
                return <Button class="btn" key={index} onClick={() => viewJobs(job)}>{job}</Button>;
            })}
    </div>
    <br/>
    <br/>
     <div className="row">
     <div className="viewjobscolumn1">
    {jobs && jobs.map(job => (
    <Card style={{ width: '18rem' }} key={job.id}>
      <Card.Body>
        <Card.Title>{job.title}</Card.Title>
      <ListGroup variant="flush">
        <ListGroup.Item>JobDesc: {job.job_desc}</ListGroup.Item>
      </ListGroup>
      <Button class="btn" onClick={() => viewJob(job.jobid)}>ViewJob</Button>
      </Card.Body>
    </Card>
    ))}
    </div>
    <div className="viewjobscolumn2">
    {jobdetails && jobdetails.map(jobdet => (
    <Card style={{ width: '30rem' }} key={jobdet.id}>
      <Card.Body>
        <Card.Title>Job Details:</Card.Title>
      <ListGroup variant="flush">
        <ListGroup.Item>Title: {jobdet.job_title}</ListGroup.Item>
        <ListGroup.Item>JobDesc: {jobdet.job_description}</ListGroup.Item>
        <ListGroup.Item>Salary Range: {jobdet.sal}</ListGroup.Item>
        <ListGroup.Item>Location: {jobdet.location}</ListGroup.Item>
        <ListGroup.Item>RequiredSkills: {jobdet.req_skills}</ListGroup.Item>
        <ListGroup.Item>PreferredSkills: {jobdet.preferred_skills}</ListGroup.Item>
      </ListGroup>
      </Card.Body>
    </Card>
   ))}
    </div>
    </div>
    </div>
    </div>}
    </div>
    );
    //return (<h1>Profile summary page in progress {responsedata.profile_id}</h1>);



}
export default Viewjobs;