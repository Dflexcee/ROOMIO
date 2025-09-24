import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { Picker } from "emoji-mart";
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaFileAlt, FaFileAudio, FaFileVideo, FaFileImage } from 'react-icons/fa';
import config from "../config/api.js";

export default function ChatDetail() {
  const { userId: targetUserId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeout = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (targetUserId) {
      fetchUser(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (user && targetUserId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Simple polling
      return () => clearInterval(interval);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  const fetchMessages = async () => {
    if (!user || !targetUserId) return;
    
    setLoading(true);
    try {
      const response = await fetch(config.getUrl(`/messages/list.php?sender_id=${user.id}&receiver_id=${targetUserId}`), {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    
    // Update typing indicator
    updateTypingIndicator(true);
    
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      updateTypingIndicator(false);
    }, 2000);
  };

  const updateTypingIndicator = async (isTyping) => {
    try {
      await fetch(config.getUrl('/typing-indicators/update.php'), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          target_user_id: targetUserId,
          is_typing: isTyping
        })
      });
    } catch (error) {
      console.error('Error updating typing indicator:', error);
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <FaFileAlt className="text-gray-400 text-2xl" />;
    if (type.startsWith('image')) return <FaFileImage className="text-pink-400 text-2xl" />;
    if (type.startsWith('audio')) return <FaFileAudio className="text-blue-400 text-2xl" />;
    if (type.startsWith('video')) return <FaFileVideo className="text-purple-400 text-2xl" />;
    if (type === 'application/pdf') return <FaFilePdf className="text-red-500 text-2xl" />;
    if (type.includes('word')) return <FaFileWord className="text-blue-700 text-2xl" />;
    if (type.includes('excel')) return <FaFileExcel className="text-green-600 text-2xl" />;
    if (type.includes('powerpoint')) return <FaFileAlt className="text-orange-500 text-2xl" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FaFileArchive className="text-yellow-500 text-2xl" />;
    return <FaFileAlt className="text-gray-400 text-2xl" />;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    
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
      
      if (uploadResponse.ok) {
        // Send message with file
        await sendMessage(uploadData.file_url, file.name, file.type);
      } else {
        setUploadError(uploadData.error || "Failed to upload file");
      }
    } catch (error) {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const sendMessage = async (content, fileName = null, fileType = null) => {
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
          file_name: fileName,
          file_type: fileType
        })
      });
      
      if (response.ok) {
        setNewMessage("");
        fetchMessages(); // Refresh messages
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
    sendMessage(newMessage);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white text-xl">Please log in to access chat</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-800 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {targetUser?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{targetUser?.full_name || 'User'}</h3>
                  <p className="text-sm opacity-75">Online</p>
                </div>
              </div>
              {otherTyping && (
                <div className="text-sm opacity-75">typing...</div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet. Start a conversation!</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {message.file_name ? (
                        <div className="flex items-center space-x-2">
                          {getFileIcon(message.file_type)}
                          <div>
                            <p className="font-medium">{message.file_name}</p>
                            <p className="text-sm opacity-75">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {uploading && (
                <div className="mb-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                </div>
              )}
              
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
                  className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"
                  title="Attach file"
                >
                  <FaPaperclip />
                </label>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={uploading}
                  />
                  {showEmoji && (
                    <div className="absolute bottom-full mb-2">
                      <Picker
                        onSelect={(emoji) => {
                          setNewMessage(prev => prev + emoji.native);
                          setShowEmoji(false);
                        }}
                        title="Pick an emoji"
                      />
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="p-2 text-gray-500 hover:text-blue-600"
                >
                  😊
                </button>
                
                <button
                  type="submit"
                  disabled={uploading || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
} 