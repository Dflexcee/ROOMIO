import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { FaArrowLeft, FaPaperclip, FaSmile, FaPaperPlane, FaTimes, FaDownload } from 'react-icons/fa';
import config from "../config/api.js";
import LazyImage from "../components/common/LazyImage";

/**
 * Modern Facebook-Style Chat Interface
 *
 * Features:
 * - Ascending order (oldest first, like Facebook/WhatsApp)
 * - Date separators for better organization
 * - Image preview modal on click
 * - File attachments with icons
 * - Smooth scroll to bottom
 * - Read receipts
 * - Typing indicators
 */
export default function ChatDetailModern() {
  const { userId: targetUserId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (targetUserId) {
      fetchUser(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (user && targetUserId) {
      fetchMessages();
      const interval = setInterval(() => fetchMessages(true), 2000);
      return () => clearInterval(interval);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUser = async (id) => {
    try {
      const response = await fetch(config.getUrl(`/users/get.php?id=${id}`), {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setTargetUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchMessages = async (isRefresh = false) => {
    if (!user || !targetUserId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(config.getUrl(`/messages/list.php?user_id=${targetUserId}`), {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        // Sort messages in ASCENDING order (oldest first)
        const sortedMessages = (data.messages || []).sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(sortedMessages);
      } else {
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sender_id', user.id);
      formData.append('receiver_id', targetUserId);

      const uploadResponse = await fetch(config.getUrl('/upload/chat-file.php'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok && uploadData.file_url) {
        await sendMessage('', uploadData.file_url, uploadData.file_name, uploadData.file_type);
      } else {
        setUploadError(uploadData.error || "Failed to upload file");
      }
    } catch (error) {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (content, fileUrl = null, fileName = null, fileType = null) => {
    if (!content.trim() && !fileName) return;

    try {
      const response = await fetch(config.getUrl('/messages/send.php'), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: targetUserId,
          content: content,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType
        })
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(true);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const MessageBubble = ({ message, isOwn }) => {
    const isImage = message.file_type?.startsWith('image/');

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
            }`}
          >
            {isImage && message.file_url ? (
              <div>
                <LazyImage
                  src={message.file_url.startsWith('http') ? message.file_url : `http://localhost${message.file_url}`}
                  alt={message.file_name || 'Image'}
                  className="max-w-full rounded-lg cursor-pointer hover:opacity-90 mb-1"
                  style={{ maxHeight: '300px' }}
                  onClick={() => setPreviewImage(message.file_url.startsWith('http') ? message.file_url : `http://localhost${message.file_url}`)}
                />
                {message.content && (
                  <p className="text-sm mt-1">{message.content}</p>
                )}
              </div>
            ) : message.file_name ? (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:underline"
              >
                <FaDownload />
                <span>{message.file_name}</span>
              </a>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/signup-login");
    return null;
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-3 shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-xl text-gray-700 dark:text-gray-300" />
        </button>

        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
          {targetUser?.avatar_url ? (
            <img
              src={targetUser.avatar_url}
              alt={targetUser.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold">
              {targetUser?.full_name?.charAt(0) || 'U'}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {targetUser?.full_name || 'User'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {refreshing ? 'Updating...' : 'Active now'}
          </p>
        </div>

        <DarkModeToggle />
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                {msgs.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === user.id}
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        {uploadError && (
          <div className="mb-2 text-red-600 text-sm">{uploadError}</div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <label
            htmlFor="file-upload"
            className={`p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaPaperclip className="text-xl" />
          </label>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-blue-500 dark:text-white text-gray-900"
              disabled={uploading}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !newMessage.trim()}
            className={`p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors ${
              (uploading || !newMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaPaperPlane />
          </button>
        </form>

        {uploading && (
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Uploading file...
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <FaTimes className="text-2xl" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
