import React, { useState } from "react";
import styled from "styled-components";
import Jobseeker from "./Jobseeker"
import Recruiter from "./Recruiter"
const Tab = styled.button`
  font-size: 15px;
  padding: 10px 60px;
  cursor: pointer;
  opacity: 1;
  background: white;
  border: 0;
  outline: 0;
  ${({ active }) =>
    active &&
    `
    border-bottom: 4px solid blue;
    opacity: 3;
    font-weight: bold;
  `}
`;
const ButtonGroup = styled.div`
  display: flex;
`;
const types = ["Job Seeker", "Recruiter"];
function TabGroup() {
  const [active, setActive] = useState(types[0]);
  return (
    <>
      <ButtonGroup>
        {types.map((type) => (
          <Tab
            key={type}
            active={active === type}
            onClick={() => setActive(type)}
          >
            {type}
          </Tab>
        ))}
      </ButtonGroup>
      <p />
       <div>
      {active == "Job Seeker" && <Jobseeker /> }
      {active == "Recruiter" && <Recruiter /> }
      </div>
      <p> Your payment selection: {active} </p>
    </>
  );
}

export default function App() {
  return <TabGroup />;
}
