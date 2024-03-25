class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase()
    if (lowerCaseMessage.includes("hello")) {
      this.actionProvider.greet()
    }
    if (lowerCaseMessage.includes("hi")) {
      console.log("dog");
      this.actionProvider.handleDog()
    }
  }
}

export default MessageParser