import React, { useEffect, useState } from 'react';
import './Chat.css';
import Navbar from '../Navbar/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/Index';

function Chat() {
  const { currentUser, getConversations, getUser } = useUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conversationUsers, setConversationUsers] = useState({});

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const convs = await getConversations();
        setConversations(convs);

        // Fetch user details for each conversation
        const users = {};
        for (const conv of convs) {
          const otherUserId = conv.user1 === currentUser.user_id ? conv.user2 : conv.user1;
          const user = await getUser(otherUserId);
          if (user) users[otherUserId] = user;
        }
        setConversationUsers(users);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [currentUser]);

  const getOtherUser = (conv) => {
    const otherUserId = conv.user1 === currentUser.user_id ? conv.user2 : conv.user1;
    return conversationUsers[otherUserId];
  };

  return (
    <>
      <Navbar />
      <div className="chat-page">
        <header className="chat-header">
          <h1>Messages</h1>
          <p>Chat with potential teammates and collaborators</p>
        </header>

        {loading ? (
          <div className="chat-empty">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <p>No conversations yet</p>
            <Link to="/users" className="btn-primary small">Browse users to start chatting</Link>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              return (
                <Link 
                  to={`/chat/${conv.conv_id}`}
                  key={conv.conv_id}
                  className="conversation-card"
                >
                  <div className="user-avatar">{otherUser?.name?.charAt(0) || '?'}</div>
                  <div className="conv-info">
                    <div className="user-name">{otherUser?.name || 'Unknown'}</div>
                    <div className="user-username">@{otherUser?.username}</div>
                  </div>
                  <div className="conv-arrow">→</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
