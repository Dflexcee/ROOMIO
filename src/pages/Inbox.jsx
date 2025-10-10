import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import PageWrapper from "../components/common/PageWrapper";
import config from "../config/api.js";

export default function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchConversations = async (uid) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(config.getUrl(config.endpoints.messages.list), {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      
      if (data.success && data.messages) {
        // Group by user (conversation view)
        const uniqueChats = {};
        data.messages.forEach((msg) => {
          const otherUserId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id;
          if (!otherUserId) return;
          if (!uniqueChats[otherUserId]) {
            uniqueChats[otherUserId] = {
              user: {
                id: otherUserId,
                full_name: msg.sender_id === uid ? msg.receiver_name : msg.sender_name,
                avatar_url: msg.sender_id === uid ? msg.receiver_avatar : msg.sender_avatar
              },
              lastMessage: msg.message,
              time: msg.sent_at,
            };
          }
        });
        setConversations(Object.values(uniqueChats));
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Inbox error:', err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openChat = (user) => {
    navigate(`/chat/${user.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <div className="pt-16">
        <PageWrapper>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400">💬 My Inbox</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading conversations...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-500">No conversations yet.</p>
          ) : (
            <div className="space-y-4">
              {conversations.map((c) => (
                <div
                  key={c.user.id}
                  onClick={() => openChat(c.user)}
                  className="bg-white dark:bg-gray-900 p-4 shadow rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border border-blue-100 dark:border-gray-800"
                >
                  <img
                    src={c.user.avatar_url || "/default-avatar.png"}
                    alt={c.user.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-pink-400"
                  />
                  <div>
                    <p className="font-semibold text-blue-700 dark:text-pink-400">{c.user.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-1">{c.lastMessage}</p>
                    <p className="text-xs text-gray-400">{new Date(c.time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
      </div>
    </div>
  );
} 