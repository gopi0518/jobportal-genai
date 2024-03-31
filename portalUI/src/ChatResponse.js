import React, { useEffect, useState,useContext } from 'react';
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
  const [queryreq, setQuery]=useState("");
  const [queryresults, setQueryResults]=useState("");
  const[searchreq, setSearchReqValue] = useState("");
  let role = "";
  const user = useContext(UserContext);
  useEffect(() => {
            const url = window.location.href;
            console.log(url)

            if(url.includes("/Recruiter")){
            role="recruiter";
            }
            else{
            role="jobseeker";
            }
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

  return (
    <div>
    {searchresults.length>0 && <div>
    <div className="flex-container">
    <h6>Recent searches:</h6>
    <div className="row">
    {searchresults.map(search => (
    <Button class="btn" onClick={() => searchProfiles(search.searchquery)}>{search.searchquery}</Button>
    ))}
    </div>
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

    </div>
    </div>}
    </div>
    );
}
export default ChatResponse;
