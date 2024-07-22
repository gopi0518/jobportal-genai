import React,{useState,useEffect} from 'react';
import {  NavLink } from "react-router-dom";
import { BrowserRouter as Router, Switch, Route,BrowserRouter } from "react-router-dom";
import Jobseeker from "./Jobseeker";
import Recruiter from "./Recruiter";
import UserContext from './user-context';

const Navbar= () =>{
 const [value, setValue] = useState("Tim");
 const [responsedata, setResponseData]=useState("");
 const handleChange = async(event) => {
   setValue(event.target.value);
   let url = 'http://localhost:5000/resume/profile?login='+event.target.value;
   console.log(url);
   const response = await fetch(url);
   const data = await response.json();
   setResponseData(data.items[0]);
   console.log(responsedata);
 };
  return (
<nav className="navbar navbar-expand-lg navbar-dark bg-primary">

            <div className="container">
                <NavLink className="navbar-brand fw-bold fs-3 px-1" to="/"> JobPortal <br/> Powered by AI</NavLink>
                <button className="navbar-toggler mx-2" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav m-auto my-2 text-center">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/">Jobseeker</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/Recruiter">Recruiter</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/test">test</NavLink>
                        </li>

                    </ul>

                </div>


            </div>


        </nav>


  );
}
export default Navbar;
