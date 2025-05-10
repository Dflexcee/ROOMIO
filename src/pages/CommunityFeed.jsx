import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import PageWrapper from "../components/common/PageWrapper";
import DarkModeToggle from "../components/common/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
    // eslint-disable-next-line
  }, []);

  const fetchPosts = async () => {
    const { data: postList } = await supabase
      .from("community_posts")
      .select("*, users(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);
    setPosts(postList || []);

    const { data: commentList } = await supabase
      .from("post_comments")
      .select("*, users(full_name)")
      .order("created_at", { ascending: true });

    const grouped = {};
    commentList?.forEach((c) => {
      if (!grouped[c.post_id]) grouped[c.post_id] = [];
      grouped[c.post_id].push(c);
    });

    setComments(grouped);
  };

  const handlePost = async () => {
    if (!form.trim() || !userId) return;
    await supabase.from("community_posts").insert([{ content: form, user_id: userId }]);
    setForm("");
    fetchPosts();
  };

  const addComment = async (postId, text) => {
    if (!text.trim() || !userId) return;
    await supabase.from("post_comments").insert([{ post_id: postId, user_id: userId, comment: text }]);
    fetchPosts();
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="absolute top-6 right-8"><DarkModeToggle /></div>
        <div className="absolute top-6 left-4 z-50">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow font-semibold transition text-sm md:text-base md:px-4 md:py-2 w-full md:w-auto mt-2 md:mt-0"
            style={{ minWidth: 0 }}
          >
            ← Dashboard
          </button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
          <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300 text-center">💬 Community Forum</h2>

            <div className="bg-white dark:bg-gray-800 p-4 shadow rounded mb-6 border border-blue-100 dark:border-gray-800">
              <textarea
                placeholder="Ask a question or share your experience (e.g. rent in UNN area?)"
                value={form}
                onChange={(e) => setForm(e.target.value)}
                className="border p-2 w-full mb-2 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              <button
                onClick={handlePost}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Post
              </button>
            </div>

            {posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 shadow p-4 rounded mb-4 border border-blue-100 dark:border-gray-800">
                <p className="text-sm text-gray-800 dark:text-gray-100">{post.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Posted by {post.users?.full_name || "User"} • {new Date(post.created_at).toLocaleString()}
                </p>

                <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  {(comments[post.id] || []).map((c) => (
                    <div key={c.id} className="border-l-2 pl-2 text-sm text-gray-700 dark:text-gray-200">
                      <strong>{c.users?.full_name || "User"}:</strong> {c.comment}
                    </div>
                  ))}
                </div>

                <CommentInput onSubmit={(text) => addComment(post.id, text)} />
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="border p-1 text-sm w-full rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
      />
      <button
        onClick={() => {
          onSubmit(text);
          setText("");
        }}
        className="mt-1 bg-gray-200 dark:bg-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        Reply
      </button>
    </div>
  );
} 