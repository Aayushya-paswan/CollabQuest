import React, { useEffect, useState, useRef } from 'react';
import './ChatWindow.css';
import Navbar from '../Navbar/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/Index';

function ChatWindow() {
  const { convId } = useParams();
  const navigate = useNavigate();
  const { currentUser, getMessages, sendMessage, getUser } = useUser();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages and user info
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const msgs = await getMessages(convId);
        setMessages(msgs);

        // Extract other user ID from conversation
        // Format: user1_user2, so we find which one isn't current user
        const parts = convId.split('_');
        const otherUserId = parts[0] === currentUser.user_id ? parts[1] : parts[0];
        const user = await getUser(otherUserId);
        setOtherUser(user);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [convId, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(convId, messageText);
      setMessageText('');
      // Refresh messages
      const msgs = await getMessages(convId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error sending message:', err);
    }
    setSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Navbar />
      <div className="chatwindow-page">
        {loading ? (
          <div className="loading">Loading chat...</div>
        ) : !otherUser ? (
          <div className="error">User not found</div>
        ) : (
          <div className="chat-container">
            <div className="chat-header-window">
              <div className="header-content">
                <button className="back-btn" onClick={() => navigate('/chat')}>←</button>
                <div className="header-info">
                  <div className="header-name">{otherUser.name}</div>
                  <div className="header-username">@{otherUser.username}</div>
                </div>
              </div>
            </div>

            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <div>👋</div>
                  <p>Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.msg_id}
                    className={`message ${msg.sender_id === currentUser.user_id ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={sending}
                className="message-input"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="send-btn"
              >
                {sending ? '⏳' : '→'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default ChatWindow;
