// new file called DogPicture.jsx
import React, { useEffect, useState, useContext } from 'react';
import UserContext from './user-context';

const AIChatResponse = (props) => {
  const [imageUrl, setImageUrl] = useState('');
  const [airesponse, setAIResponseData] = useState('');
  let role = "";
  let url = "";
  let querybody = "";
  const user = useContext(UserContext);
  useEffect(() => {
    console.log(props.state.messages);
    let len = props.state.messages.length
    const fetchAIresponse = async () => {
            console.log(role);
            if(user.role=="Ask Doc"){
              url="/jobportal/querydoc?login=";
              role="AskDoc";
              querybody={"searchquery": props.state.messages[len-2].message,"filename":"StateUnion.pdf" }
              }
          else{
             url="/jobportal/aichat?login=";
             role="AIChat";
             querybody={"messages": props.state.messages }
            }
            const response = await fetch(url+user.name+'&role='+role,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(querybody)
            })
            const data = await response.json();
            console.log(data.airesponse);
            setAIResponseData(data.airesponse);
        }
        fetchAIresponse();
  }, []);

  return (
    <div>
      <p>{airesponse}</p>
    </div>
  );
};

export default AIChatResponse;