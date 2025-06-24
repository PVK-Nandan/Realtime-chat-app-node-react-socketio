// frontend/src/Chat.js
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./Chat.css";

const socket = io("https://realtime-chat-app-node-react-socketio.onrender.com");

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [tempUsername, setTempUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("chat_history", (data) => {
      setChat(data);
    });

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("user_typing", (name) => {
      if (name !== username) {
        setTypingStatus(`${name} is typing...`);
      }
    });

    socket.on("stop_typing", () => {
      setTypingStatus("");
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat_history");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("stop_typing");
      socket.off("online_users");
    };
  }, [username]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      const finalUsername = tempUsername.trim();
      setUsername(finalUsername);
      setShowUsernameModal(false);
      socket.emit("user_joined", finalUsername);
      
      // Focus on input after username is set
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const sendMessage = () => {
    if (message.trim() && username) {
      const messageData = {
        message: message.trim(),
        username,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random()
      };
      
      socket.emit("send_message", messageData);
      setMessage("");
      socket.emit("stop_typing");
      setIsTyping(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      socket.emit("user_typing", username);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop_typing");
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUsernameKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUsernameSubmit();
    }
  };

  const getMessageAlignment = (messageUsername) => {
    return messageUsername === username ? 'own' : 'other';
  };

  const getAvatarColor = (messageUsername) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFB7B2'
    ];
    const index = messageUsername.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (showUsernameModal) {
    return (
      <div className="username-modal-overlay">
        <div className="username-modal">
          <div className="modal-header">
            <h2>👋 Welcome to Chat!</h2>
            <p>Enter your name to join the conversation</p>
          </div>
          <div className="modal-body">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={handleUsernameKeyPress}
              placeholder="Your name..."
              className="username-input"
              maxLength={20}
              autoFocus
            />
            <button 
              onClick={handleUsernameSubmit}
              className="join-button"
              disabled={!tempUsername.trim()}
            >
              Join Chat 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="chat-title">
            <h2>💬 Live Chat</h2>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="chat-info">
            <div className="user-info">
              <div className="current-user">
                <div 
                  className="user-avatar"
                  style={{ backgroundColor: getAvatarColor(username) }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="username">{username}</span>
              </div>
            </div>
            <span className="message-count">{chat.length} messages</span>
          </div>
        </div>
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {chat.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💭</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chat.map((msg, i) => (
            <div key={msg.id || i} className={`message-wrapper ${getMessageAlignment(msg.username)}`}>
              <div className="message">
                <div className="message-header">
                  <div 
                    className="user-avatar small"
                    style={{ backgroundColor: getAvatarColor(msg.username) }}
                  >
                    {msg.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
        
        {typingStatus && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">{typingStatus}</span>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={message}
            placeholder="Type your message..."
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            className="message-input"
            disabled={!isConnected}
          />
          <button 
            onClick={sendMessage} 
            className="send-button"
            disabled={!message.trim() || !isConnected}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;