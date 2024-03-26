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
const ViewProfiles = () =>  {
    const [searchlist, setResponseData]=useState("");
    const [queryreq, setQuery]=useState("");
    const [queryresults, setQueryResults]=useState("");
    const [searchreq, setSearchReqValue] = useState("");
    const user = useContext(UserContext);
    console.log(user.name)
      useEffect(() => {
            const fetchData = async () => {
            const response = await fetch('/jobportal/recentsearch?login='+user.name)
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
            const response = await fetch('http://localhost:5000/jobportal/matchprofiles?login='+user.name,{
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

    return(
    <div>
    <div className="row">
    <input type="text" name="serachreq" placeholder="Ex: Solution architects" size="50" value={searchreq} onChange={(e) => {setSearchReqValue(e.target.value)}}/>
    <Button class="btn" onClick={() => searchProfiles(searchreq)}>Search</Button>
    </div>
    <br />
    {searchlist.length>0 && <div>
    <div className="flex-container">
    <h6>Recent searches:</h6>
    <div className="row">
    {searchlist.map(search => (
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
        <ListGroup.Item>ProfileSummary: {profile.profile_summary}</ListGroup.Item>
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
    //return (<h1>Profile summary page in progress {responsedata.profile_id}</h1>);



}
export default ViewProfiles;
