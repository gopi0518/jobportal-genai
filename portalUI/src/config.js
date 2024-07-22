import { createChatBotMessage,createCustomMessage } from 'react-chatbot-kit';
import { useContext} from 'react';
import ChatResponse from './ChatResponse';
import AIChatResponse from './AIChatResponse';
import UserContext from './user-context';
import WelcomeMessage from './WelcomeChatMessage'
const user = "";
const config = {
  botName: "JobportalBot",

  initialMessages: [createCustomMessage('Test', 'custom'),createChatBotMessage(`Hi, I am your personalized Jobportal Agent. What do you want to learn?`,
      {
      widget: "chatResponse",
    })],
  floating: true,
  customMessages: {
    custom: (props) => <WelcomeMessage {...props} />,
  },
  widgets: [
    {
      widgetName: 'chatResponse',
      widgetFunc: (props) => <ChatResponse {...props} />,
    },
    {
      widgetName: 'aiChatResponse',
      widgetFunc: (props) => <AIChatResponse {...props} />,
    }
  ],
}

export default config