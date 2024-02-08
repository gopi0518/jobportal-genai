import './index.css';
import {useState, useEffect} from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Navbar from "./navbar"
import alanBtn from '@alan-ai/alan-sdk-web'
import Jobseeker from "./Jobseeker"
import Recruiter from "./Recruiter"
function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path='/' exact component={Jobseeker} />
        <Route path='/Recruiter' component={Recruiter} />
        <Route path='/Jobseeker' component={Jobseeker} />
      </Switch>
    </Router>
  );
}

export default App;