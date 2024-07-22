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
      this.actionProvider.handleChat()
    }
    else {
      this.actionProvider.handleAICalls(message)
    }
  }
}

export default MessageParser