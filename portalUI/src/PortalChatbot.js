//import ChatBot from 'react-simple-chatbot';
import Chatbot from 'react-chatbot-kit'
import { ThemeProvider } from 'styled-components';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import DogPicture from './DogPicture';
import 'react-chatbot-kit/build/main.css'
import config from './config';
// Creating our own theme
const theme = {
	background: '#C9FF8F',
	headerBgColor: '#197B22',
	headerFontSize: '10px',
	botBubbleColor: '#0F3789',
	headerFontColor: 'white',
	botFontColor: 'white',
	userBubbleColor: '#FF5733',
	userFontColor: 'white',
};


const PortalChatbot = () => {

	return (
		<div className="App">
		<div style={{ maxWidth: "300px" }}>
			<ThemeProvider theme={theme}>
				        <Chatbot config={config} actionProvider={ActionProvider} messageParser={MessageParser} />
			</ThemeProvider>
		</div>
       </div>
	);
}

export default PortalChatbot;
