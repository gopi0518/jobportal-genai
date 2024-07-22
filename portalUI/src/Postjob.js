import {useState, useEffect} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Uploadjobpost from "./Uploadjobpost"
import Createjobpost from "./Createjobpost"

const HorizantalTab = ({ label, to }) => (
  <Link to={to} className="tab">
    {label}
  </Link>
);

const Postjob = () =>  {
  return (
    <div className="horizantal-tabs">

      <Router>
        <div className="horizantal-tab-list">
          <HorizantalTab label="Upload Jobposting" to="/UploadJob" />
          <HorizantalTab label="Create Jobposting(AI Driven)" to="/CreateJobpost" />
        </div>
        <div className="tab-content">
          <Switch>
            <Route path="/" exact component={Uploadjobpost} />
            <Route path="/UploadJob" component={Uploadjobpost} />
            <Route path="/CreateJobpost" component={Createjobpost} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default Postjob;

