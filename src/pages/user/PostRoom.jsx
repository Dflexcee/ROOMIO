import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import BecomeVerifiedForm from "../../components/user/BecomeVerifiedForm";

export default function PostRoom() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) throw new Error('No active session');

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setUser(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Check if user needs verification
  if (user && user.verification_status !== "verified") {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4">
        <BecomeVerifiedForm 
          userId={user.id} 
          onSuccess={() => {
            fetchUserProfile();
          }} 
        />
      </div>
    );
  }

  // If user is verified, show the post room form
  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Post a New Room</h1>
      {/* Post Room Form will go here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          You are verified as a {user?.account_type}. You can now post rooms.
        </p>
        {/* Add your post room form here */}
      </div>
    </div>
  );
} 