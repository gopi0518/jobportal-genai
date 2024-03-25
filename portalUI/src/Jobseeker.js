import React,{useContext} from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import Postresume from "./Postresume";
import Recruiter from "./Recruiter";
import PortalChatbot from "./PortalChatbot";
import ProfileSummary from "./ProfileSummary";
import Viewjobs from "./Viewjobs";
import UserContext from './user-context';
const VerticalTab = ({ label, to }) => (
  <Link to={to} className="tab">
    {label}
  </Link>
);

const Jobseeker = () => {
  //const { username } = useContext(UserContext);
  //console.log(user.name);
  return (

    <div className="vertical-tabs">

      <Router>
        <div className="tab-list">
          <VerticalTab label="Post your resume" to="/Postresume" />
          <VerticalTab label="View Jobs" to="/Viewjobs" />
          <VerticalTab label="Profile Summary" to="/ProfileSummary" />
          {/*<VerticalTab label="Portal Chatbot" to="/PortalChatbot" />*/}
        </div>
        <div className="tab-content">
          <Switch>
            <Route path="/Postresume" component={Postresume} />
            <Route path="/ViewJobs" component={Viewjobs} />
            <Route path="/ProfileSummary" component={ProfileSummary} />
            {/*<Route path="/PortalChatbot" component={PortalChatbot} />*/}
          </Switch>
        </div>
      </Router>
    </div>

  );
};

export default Jobseeker;
