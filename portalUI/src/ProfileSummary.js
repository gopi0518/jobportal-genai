import React,{useState,useEffect,useContext} from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import UserContext from './user-context';
const ProfileSummary = () =>  {
    const [responsedata, setResponseData]=useState("");
    const user = useContext(UserContext);
    console.log(user.name)
      useEffect(() => {
            const fetchData = async () => {
            const response = await fetch('/jobportal/profile?login='+user.name)
            const data = await response.json();
            console.log(data);
            setResponseData(data.items);
        }
        fetchData();
    }, []);

    return(
    <div>
    {responsedata && <div>
    {responsedata.map(profile => (
    //<li key={menuItem.id}>{menuItem.location} - {menuItem.skills}
    //</li>
    <div className="flex-container">
    {/*<Card style={{ width: '15rem' }} key={profile.id}>
      <Card.Body>
        <Card.Title>{profile.first_name} {profile.last_name}</Card.Title>
        <Card.Text>
          TechnicalSkills: {profile.tech_skills}
        </Card.Text>
        <Button variant="primary">View Profile</Button>
      </Card.Body>
    </Card>*/}
    <div className="row">
    <div className="profilecolumn1">
    <Card style={{ width: '22rem' }} key={profile.profile_id}>
      <Card.Body>
        <Card.Title>Resume Summary</Card.Title>
        <ListGroup variant="flush">
        <ListGroup.Item>FirstName: {profile.first_name}</ListGroup.Item>
        <ListGroup.Item>LastName: {profile.last_name}</ListGroup.Item>
        <ListGroup.Item>Email: {profile.email}</ListGroup.Item>
        <ListGroup.Item>Jobtitle: {profile.job_title}</ListGroup.Item>
        <ListGroup.Item>TechnicalSkills: {profile.tech_skills}</ListGroup.Item>
        <ListGroup.Item>RecommendedJobs: {profile.recommended_jobs}</ListGroup.Item>
      </ListGroup>
      </Card.Body>
    </Card>
    </div>
    <div className="profilecolumn2">
    <Card style={{ width: '20rem' }} key={profile.profile_id}>
      <Card.Body>
        <Card.Title>Extracted from Linkedin</Card.Title>
        <ListGroup variant="flush">
        <ListGroup.Item>ProfileSummary</ListGroup.Item>
        <ListGroup.Item>{profile.linkedin_pf_summary}</ListGroup.Item>
      </ListGroup>
      </Card.Body>
    </Card>
    </div>
    </div>
    </div>
    ))}
    </div>}
    </div>
    );
    //return (<h1>Profile summary page in progress {responsedata.profile_id}</h1>);



}
export default ProfileSummary;
