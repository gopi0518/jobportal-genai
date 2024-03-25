import { useState } from ‘react’;

const useChatMessages = () => {
const [messages, setMessages] = useState([]);

const addMessage = (message) => {
setMessages((prevMessages) => […prevMessages, message]);
};

return { messages, addMessage };
};

export default useChatMessages;