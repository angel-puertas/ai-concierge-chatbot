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
  const MAX_MESSAGE_LENGTH = 400;
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const remaining = MAX_MESSAGE_LENGTH - input.length;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const sendMessage = async () => {
    if (!input.trim()) return;

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

  const clearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm("Clear chat history?")) {
      setMessages([]);
      setInput("");
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            // enforce max length (prevents longer input)
            setInput(
              v.length <= MAX_MESSAGE_LENGTH
                ? v
                : v.slice(0, MAX_MESSAGE_LENGTH)
            );
          }}
          aria-describedby="charCounter"
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className={styles.messageInput}
          placeholder={placeholderText}
        />
        <div
          id="charCounter"
          className={`${styles.charCounter} ${
            remaining <= 20 ? styles.charCounterWarning : ""
          }`}
          aria-live="polite"
        >
          {input.length}/{MAX_MESSAGE_LENGTH}
        </div>
        <button onClick={sendMessage} className={styles.sendButton}>
          Send
        </button>
        <button
          onClick={clearChat}
          className={`${styles.sendButton} ${styles.clearButton}`}
          type="button"
        >
          Clear
        </button>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "#666",
          textAlign: "center",
          marginTop: "8px",
        }}
      >
        {language === "hr" ? "Pokreće AI — " : "Powered by AI — "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          {language === "hr" ? "Pravila privatnosti" : "Privacy policy"}
        </a>
      </div>
    </div>
  );
};

export default ChatWidget;
