import React, { useState } from 'react';
import axios from 'axios';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const ChatWidget = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');

    const sendMessage = async () => {
        if (!input) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const res = await axios.post<{ answer: string }>('/api/chat', { message: input, lang: 'en' });
            const botMessage: Message = { sender: 'bot', text: res.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <b>{msg.sender}:</b> {msg.text}
                    </div>
                ))}
            </div>
            <input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatWidget;
