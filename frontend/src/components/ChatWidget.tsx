import React, { useState } from "react";
import axios from "axios";
import styles from "./ChatWidget.module.css";

type Language = "en" | "hr";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatWidget = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [language, setLanguage] = useState<Language>("en");

  const sendMessage = async () => {
    if (!input) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post<{ answer: string }>(
        `${import.meta.env.VITE_API_TARGET}/api/chat`,
        { message: input, lang: language }
      );
      const botMessage: Message = { sender: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.languageSelectContainer}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className={styles.languageSelect}
        >
          <option value="en">English (EN)</option>
          <option value="hr">Hrvatski (HR)</option>
        </select>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${
              msg.sender === "user" ? styles.userMessage : styles.botMessage
            }`}
          >
            <span className={styles.senderName}>{msg.sender}:</span> {msg.text}
          </div>
        ))}
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className={styles.messageInput}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
