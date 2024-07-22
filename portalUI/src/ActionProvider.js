import ChatResponse from "./ChatResponse"
import AIChatResponse from "./AIChatResponse"

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  greet() {

    const greetingMessage = this.createChatBotMessage("Hi friend..")
    this.updateChatbotState(greetingMessage)
  }

  handleChat = () => {
    const botMessage = this.createChatBotMessage(
      "Based on profile context!!",
      {
        widget: 'chatResponse',
      }
    );
   this.updateChatbotState(botMessage)
}
handleAICalls = (message) => {
    const botMessage = this.createChatBotMessage(
      "AI is preparing response for you!!",
      {
        widget: 'aiChatResponse',
      }
    );
   this.updateChatbotState(botMessage)
}



  updateChatbotState(message) {

// NOTE: This function is set in the constructor, and is passed in      // from the top level Chatbot component. The setState function here     // actually manipulates the top level state of the Chatbot, so it's     // important that we make sure that we preserve the previous state.
   console.log(message);

   this.setState(prevState => ({
    	...prevState, messages: [...prevState.messages, message]
    }))
  }
}

export default ActionProvider