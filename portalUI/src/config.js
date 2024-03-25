import { createChatBotMessage } from 'react-chatbot-kit';
import ChatResponse from './ChatResponse';


const config = {
  botName: "JobportalBot",
  initialMessages: [createChatBotMessage("Hi, I'm here to help. What do you want to learn?")],
  floating: true,
  widgets: [
    {
      widgetName: 'chatResponse',
      widgetFunc: (props) => <ChatResponse {...props} />,
    },
  ],
}

export default config