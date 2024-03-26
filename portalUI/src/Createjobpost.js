import React,{useState,useEffect,useContext} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import UserContext from './user-context';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
const Createjobpost = () =>  {
const user = useContext(UserContext);
console.log(user.name)
const [jobreqin, setJobReqValue] = useState("");
const [jobreq, setJobReq]=useState("");
const [jobpost, setJobposting]=useState("");
const [jobpostreqid, setJobpostingreq]=useState("");
const [showDelayedText, setShowDelayedText] = useState(false);

const viewJobposting = (reqid) => {
    console.log(reqid);
    const fetchjobpost= async () => {
            console.log(reqid);
            setTimeout(() => {
            setShowDelayedText(true);
        }, 60000);
            const response = await fetch('/jobportal/jobpost?jobid='+reqid,{
            method: "GET"
            }
            )
            const viewjobpost = await response.json();
            setJobposting(viewjobpost.items);
            //console.log(profiles)
            console.log(viewjobpost.items);
        }
        fetchjobpost();
}

const createJobposting = (jobreqin) => {
    console.log(jobreqin);
    setJobReq(jobreqin);
    const fetchresults = async () => {
            console.log(jobreqin);
            const response = await fetch('http://localhost:5000/jobportal/createjobpost?login='+user.name,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"postreq": jobreqin})
            }
            )
            const jobposting = await response.json();
            //console.log(profiles)
            console.log(jobposting);
            viewJobposting(jobposting.reqid)
            setJobpostingreq(jobposting.reqid)
        }
        fetchresults();
}

return(
<div>
<div className="row">
    <input type="text" name="jobreq" placeholder="Ex: prepare job posting for kafka developer" size="50" value={jobreqin} onChange={(e) => {setJobReqValue(e.target.value)}}/>
    <Button class="btn" onClick={() => createJobposting(jobreqin)}>Create Jobpost</Button>
    </div>
    <br/>
{jobpostreqid && <div className="row">
    <Button class="btn" onClick={() => viewJobposting(jobpostreqid)}>View Jobpost</Button>
    </div>}
    <br/>
    <br/>

 {jobpost && <div>
 {jobpost.map(job => (
  <div className="row">
    <p>JobDescription: {job.job_description}</p>
    <p>Location: {job.location}<br/>
    Required Qualifications:<br/>
    {job.req_skills} <br/>
    Preferred Qualifications:<br/>
    {job.preferred_skills}<br/>
    </p><br/>
    </div>))}
    </div>}
    </div>
);
}

export default Createjobpost;
