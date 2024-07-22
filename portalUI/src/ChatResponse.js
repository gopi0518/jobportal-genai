import React, { useEffect, useState,useContext,useRef } from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import UserContext from './user-context';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
const ChatResponse = () => {

  const [searchresults, setResponseData] = useState('');
  let showrecJobs = "No";
  const [queryreq, setQuery]=useState("");
  const [jobs, setJobList]=useState("");
  const [queryresults, setQueryResults]=useState("");
  const [careerPath, setCareerPath] = useState("");
  const [searchreq, setSearchReqValue] = useState("");
  const [location, setLocation]=useState("");
  const [profilerole,setProfileRole]=useState("");
  const [recjobs, setRecJobsList]=useState("");
  let role = "";
  const user = useContext(UserContext);
  useEffect(() => {
            const url = window.location.href;
            console.log(url)
            console.log(user.role)

            /*if(url=="Recruiter")){
            role="recruiter";
            setProfileRole(role);
            }
            else{
            role="jobseeker";
            setProfileRole(role);
            }*/
            if(user.role=="Recruiter"){
            role="recruiter";
            setProfileRole(role);
            }
            else if(user.role=="Ask Doc"){
            role="AskDoc";
            setProfileRole(role);
            }
            else{
            role="jobseeker";
            setProfileRole(role);
            }
            console.log(role);
            const fetchData = async () => {
            console.log(role);
            const response = await fetch('/jobportal/recentsearch?login='+user.name+'&role='+role)
            const data = await response.json();
            console.log(data);
            setResponseData(data.items);
        }
        fetchData();
    }, []);

  const searchProfiles = (query) => {
    setQuery(query);
    const fetchresults = async () => {
            console.log(queryreq);
            const response = await fetch('/jobportal/matchprofiles?login='+user.name+'&role='+role,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"searchquery": query})
            }
            )
            const profiles = await response.json();
            //console.log(profiles)
            setQueryResults(profiles.items);
            console.log(queryresults);
        }
        fetchresults();
   }
    const viewJobs = () => {
           const fetchData = async () => {
            const profile = await fetch('/jobportal/profile?login='+user.name+'&role=jobseeker')
            const profiledata = await profile.json();
            console.log(profiledata);
            setLocation(profiledata.items[0].location);
            //setCurrentTitle(profiledata.items[0].location)
            let recjobs = profiledata.items[0].recommended_jobs.split(",",10);
            //let careerpath = profiledata.items[0].paths[0]
            //setCareerPath(careerpath)
            setRecJobsList(recjobs)
            }
            fetchData();
   }

   const fetchJobs = (query) => {
   const listjobs = async () => {
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
        listjobs();


   }

   const viewJob = (jobid) => {
    const fetchjob = async () => {
            const response = await fetch('http://localhost:5000/jobportal/jobpost?jobid='+jobid)
            const job = await response.json();
            //console.log(profiles)
            //getJobdetails(job.items);
            console.log(job);
        }
        fetchjob();
   }
   const careerGuide = () => {
   const careerData = async () => {
            const profile = await fetch('/jobportal/profilechat?login='+user.name+'&role=jobseeker')
            const profiledata = await profile.json();
            console.log(profiledata);
            //setCurrentTitle(profiledata.items[0].location)
            //let recjobs = profiledata.items[0].recommended_jobs.split(",",10);
            let careerpath = profiledata.items
            setCareerPath(careerpath[0].paths)
            //setRecJobsList(recjobs)
            }
            careerData();
   }

  return (
    <div>
    <div className="flex-container">
    {profilerole == "jobseeker" && <div>
    <Button variant="outline-primary" class="btn" onClick={() => viewJobs()}>ViewJobs</Button>{' '}
    <Button variant="outline-primary" class="btn" onClick={() => careerGuide()}>CareerGuide</Button>
    <br/>
    <br/>
    </div>
    }
    {profilerole == "recruiter" && <div>
    <Button variant="outline-primary" class="btn" onClick={() => searchProfiles('Solution Architect')}>ViewProfiles</Button>{' '}
    <br/>
    <br/>
    </div>
    }
    {recjobs && <div className="row">
    <h6>Recommended jobs:</h6>
    {recjobs.map((job, index) => {
                return <Button class="btn" variant="outline-primary" key={index} onClick={() => fetchJobs(job)}>{job}</Button>;
            })}
    </div>}
    {careerPath && <div className="row">
    <h6>CareerGuide:</h6>
    <br/>
    <div className="row">
    {careerPath && careerPath.map(guide => (
    <Card style={{ width: '20rem' }} key={guide.title}>
      <Card.Body>
        <Card.Title>{guide.title}</Card.Title>
      <ListGroup variant="flush">
        <a href={guide.rec_courses}>{guide.title}-Course</a>
      </ListGroup>
      </Card.Body>
    </Card>
    ))}
    </div>
    </div>}
    {searchresults.length>0 && <div>
    <h6>Recent searches:</h6>
    {searchresults && searchresults.map(search => (
    <Button variant="outline-primary" class="btn" onClick={() => searchProfiles(search.searchquery)}>{search.searchquery}</Button>
    ))}
    </div>
    }
    <br/>
    <br/>
      <div className="row">
    {queryresults && queryresults.map(profile => (
    <Card style={{ width: '20rem' }} key={profile.profile_id}>
      <Card.Body>
        <Card.Title>{profile.first_name} {profile.last_name}</Card.Title>
      <ListGroup variant="flush">
        <ListGroup.Item>FirstName: {profile.first_name}</ListGroup.Item>
        <ListGroup.Item>LastName: {profile.last_name}</ListGroup.Item>
        <ListGroup.Item>Email: {profile.email}</ListGroup.Item>
      </ListGroup>
      <Button class="btn">ViewProfile</Button>
      </Card.Body>
    </Card>
    ))}
    </div>

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
    </div>

    </div>

    </div>
    );
}
export default ChatResponse;
