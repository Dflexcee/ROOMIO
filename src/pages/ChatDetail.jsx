import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import PageWrapper from "../components/common/PageWrapper";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { Picker } from "emoji-mart";
import { createClient } from '@supabase/supabase-js';
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaFileAlt, FaFileAudio, FaFileVideo, FaFileImage } from 'react-icons/fa';

export default function ChatDetail() {
  const { userId: targetUserId } = useParams();
  const [userId, setUserId] = useState(null);
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
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (targetUserId) {
      fetchUser(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (userId && targetUserId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Simple polling
      return () => clearInterval(interval);
    }
  }, [userId, targetUserId]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (userId && targetUserId) {
      // Listen for typing indicator (if table exists)
      const channel = supabase
        .channel('typing-indicator')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'typing_indicators' }, (payload) => {
          if (payload.new.user_id === targetUserId && payload.new.chat_partner_id === userId) {
            setOtherTyping(payload.new.is_typing);
          }
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, targetUserId]);

  const fetchUser = async (id) => {
    const { data } = await supabase.from("users").select("*").eq("id", id).single();
    setTargetUser(data);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
      .order("sent_at", { ascending: true });
    const filtered = data.filter(
      (m) =>
        (m.sender_id === userId && m.receiver_id === targetUserId) ||
        (m.sender_id === targetUserId && m.receiver_id === userId)
    );
    setMessages(filtered);
    setLoading(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    // Update typing indicator in DB
    supabase.from('typing_indicators').upsert({
      user_id: userId,
      chat_partner_id: targetUserId,
      is_typing: true,
      last_typed_at: new Date().toISOString(),
    });
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      supabase.from('typing_indicators').upsert({
        user_id: userId,
        chat_partner_id: targetUserId,
        is_typing: false,
        last_typed_at: new Date().toISOString(),
      });
    }, 2000);
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
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      // Use fetch to track progress
      const upload = await supabase.storage.from('chat_files').upload(filePath, file, {
        upsert: false,
        onUploadProgress: (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        }
      });
      if (upload.error) throw upload.error;
      const { data: urlData } = supabase.storage.from('chat_files').getPublicUrl(filePath);
      await supabase.from('messages').insert([
        {
          sender_id: userId,
          receiver_id: targetUserId,
          message: '',
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_name: file.name,
          sent_at: new Date().toISOString(),
        },
      ]);
      fetchMessages();
    } catch (err) {
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from("messages").insert([
      {
        sender_id: userId,
        receiver_id: targetUserId,
        message: newMessage,
        sent_at: new Date().toISOString(),
      },
    ]);
    setNewMessage("");
    setShowEmoji(false);
    fetchMessages();
    // Set typing to false
    setTyping(false);
    supabase.from('typing_indicators').upsert({
      user_id: userId,
      chat_partner_id: targetUserId,
      is_typing: false,
      last_typed_at: new Date().toISOString(),
    });
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
  };

  if (!targetUser) return <div className="p-6">Loading chat...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <PageWrapper>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 text-center">💬 Chat with {targetUser.full_name}</h2>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-2xl h-[60vh] overflow-y-auto space-y-3 mb-4 border border-blue-100 dark:border-gray-800 flex flex-col">
            {loading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400">No messages yet. Say hi! 👋</div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex items-end gap-2 ${msg.sender_id === userId ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {msg.sender_id !== userId && (
                    <img
                      src={targetUser.avatar_url || "/default-avatar.png"}
                      alt={targetUser.full_name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-pink-400"
                    />
                  )}
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow text-base break-words ${
                      msg.sender_id === userId
                        ? "bg-gradient-to-r from-pink-500 to-yellow-500 text-white ml-auto"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    {msg.file_url ? (
                      msg.file_type && msg.file_type.startsWith('image') ? (
                        <img src={msg.file_url} alt={msg.file_name} className="max-w-[200px] max-h-[200px] rounded mb-2" />
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          {getFileIcon(msg.file_type)}
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-pink-400" title={msg.file_name}>
                            {msg.file_name || 'File'}
                          </a>
                        </div>
                      )
                    ) : null}
                    <span>{msg.message}</span>
                    <div className="text-xs text-gray-300 dark:text-gray-400 mt-1 text-right">
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.sender_id === userId && (
                    <img
                      src={"/default-avatar.png"}
                      alt="You"
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-pink-400"
                    />
                  )}
                </div>
              ))
            )}
            {otherTyping && (
              <div className="text-xs text-gray-500 italic mt-2">{targetUser.full_name} is typing...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 items-end mt-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                className="border p-3 rounded-full w-full bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                disabled={uploading}
              />
              <button
                type="button"
                className="absolute right-12 top-1/2 -translate-y-1/2 text-xl"
                onClick={() => setShowEmoji((v) => !v)}
                title="Add emoji"
                disabled={uploading}
              >
                😊
              </button>
              <label htmlFor="file-upload" className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer text-2xl text-gray-400 hover:text-pink-400 transition" style={{ zIndex: 2 }}>
                <FaPaperclip />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/zip,application/x-rar-compressed,application/x-7z-compressed,application/x-tar,application/x-gzip,application/octet-stream,audio/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                  title="Send file or image"
                />
              </label>
              {uploading && <div className="absolute left-10 top-1/2 -translate-y-1/2 text-xs text-blue-500">Uploading... {uploadProgress}%</div>}
              {uploadError && <div className="absolute left-10 top-1/2 -translate-y-1/2 text-xs text-red-500">{uploadError}</div>}
            </div>
            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all text-lg font-semibold"
              disabled={uploading || !newMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
} 