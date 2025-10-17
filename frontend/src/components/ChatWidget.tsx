import React, { useState } from "react";
import axios from "axios";
import styles from "./ChatWidget.module.css";

type Language = "en" | "hr";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const ChatWidget = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const sendMessage = async () => {
    if (!input) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post<{ answer: string }>(
        `${import.meta.env.VITE_API_TARGET}/api/chat`,
        { message: input, lang: language }
      );
      const botMessage: Message = {
        sender: "bot",
        text: res.data.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const placeholderText =
    language === "hr" ? "Upišite svoju poruku..." : "Type your message...";

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
            <div className={styles.messageHeader}>
              <span className={styles.senderName}>{msg.sender}</span>
              <span className={styles.timestamp}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <div className={styles.messageBody}>{msg.text}</div>{" "}
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
          placeholder={placeholderText}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
