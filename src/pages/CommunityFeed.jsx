import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import config from "../config/api.js";
import BannerAd from "../components/ads/BannerAd";
import PopupAd from "../components/ads/PopupAd";

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const { user, loading } = useAuth();
  const [form, setForm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.communityPosts.list), {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts || []);
        setComments(data.comments || {});
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePost = async () => {
    if (!form.trim() || !user) return;
    
    try {
      const response = await fetch(config.getUrl(config.endpoints.communityPosts.create), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          content: form,
          user_id: user.id
        })
      });
      
      if (response.ok) {
        setForm("");
        fetchPosts();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to post");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const addComment = async (postId, text) => {
    if (!text.trim() || !user) return;
    
    try {
      const response = await fetch(config.getUrl(config.endpoints.communityPosts.comment), {
        method: 'POST',
        headers: config.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          post_id: postId,
          user_id: user.id,
          comment: text
        })
      });
      
      if (response.ok) {
        fetchPosts();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add comment");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/signup-login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4 px-4">
        <DarkModeToggle />
      </div>
      <Navbar />
      <BannerAd position="top" />
      <PopupAd />
      <div className="flex-1 w-full px-2 sm:px-4 py-4 pt-20 overflow-x-hidden">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-blue-100 dark:border-gray-800">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 sm:mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm text-center">💬 Community Forum</h2>

            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 shadow rounded-lg mb-4 sm:mb-6 border border-blue-100 dark:border-gray-800">
              <textarea
                placeholder="Ask a question or share your experience..."
                value={form}
                onChange={(e) => setForm(e.target.value)}
                className="border p-2 w-full mb-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                rows={3}
              />
              <button
                onClick={handlePost}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
              >
                Post
              </button>
            </div>

            {posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 shadow p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 border border-blue-100 dark:border-gray-800">
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 break-words">{post.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Posted by {post.user_name || "User"} • {new Date(post.created_at).toLocaleDateString()}
                </p>

                <div className="mt-3 space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                  {(comments[post.id] || []).map((c) => (
                    <div key={c.id} className="border-l-2 border-blue-300 pl-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 break-words">
                      <strong className="font-semibold">{c.user_name || "User"}:</strong> {c.comment}
                    </div>
                  ))}
                </div>

                <CommentInput onSubmit={(text) => addComment(post.id, text)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-2 sm:mt-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="border p-1.5 sm:p-2 text-xs sm:text-sm w-full rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
      />
      <button
        onClick={() => {
          onSubmit(text);
          setText("");
        }}
        className="mt-1.5 sm:mt-2 bg-gray-200 dark:bg-gray-700 text-xs sm:text-sm px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 w-full sm:w-auto"
      >
        Reply
      </button>
    </div>
  );
} 