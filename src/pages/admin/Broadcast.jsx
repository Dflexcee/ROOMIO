import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import PageWrapper from "../../components/common/PageWrapper";
import { broadcastService } from "../../services/broadcastService";

export default function Broadcast() {
  const [users, setUsers] = useState([]);
  const [audience, setAudience] = useState("all");
  const [channel, setChannel] = useState("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    tenants: 0,
    landlords: 0,
    agents: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (error) throw error;

      setUsers(data || []);
      
      // Calculate stats
      const stats = {
        total: data.length,
        verified: data.filter(u => u.verification_status === "verified").length,
        tenants: data.filter(u => u.account_type === "tenant").length,
        landlords: data.filter(u => u.account_type === "landlord").length,
        agents: data.filter(u => u.account_type === "agent").length
      };
      
      setStats(stats);
    } catch (err) {
      setError("Failed to fetch users: " + err.message);
    }
  };

  const filterUsers = () => {
    if (audience === "all") return users;
    if (audience === "verified") return users.filter((u) => u.verification_status === "verified");
    return users.filter((u) => u.account_type === audience);
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }
    if (!body.trim()) {
      setError("Please enter a message");
      return;
    }

    const targets = filterUsers();
    if (targets.length === 0) {
      setError("No users found for this audience");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Log to broadcast history
      const { error: broadcastError } = await supabase
        .from("broadcasts")
        .insert({
          subject,
          body,
          channel,
          audience,
          target_count: targets.length,
          sent_at: new Date().toISOString()
        });

      if (broadcastError) throw broadcastError;

      // Send the broadcast
      const results = await broadcastService.sendBroadcast(
        targets,
        channel,
        subject,
        body
      );

      if (results.failed > 0) {
        setError(`Broadcast partially sent. ${results.success} successful, ${results.failed} failed.`);
      } else {
        setSuccess(`Broadcast sent successfully to ${results.success} users!`);
        setSubject("");
        setBody("");
      }
    } catch (err) {
      setError("Failed to send broadcast: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📣 Send Broadcast</h2>
          <div className="text-sm text-gray-600">
            Total Users: {stats.total}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Audience Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-600">Verified</div>
                <div className="text-xl font-bold">{stats.verified}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-600">Tenants</div>
                <div className="text-xl font-bold">{stats.tenants}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-600">Landlords</div>
                <div className="text-xl font-bold">{stats.landlords}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-sm text-yellow-600">Agents</div>
                <div className="text-xl font-bold">{stats.agents}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-xl font-bold">{stats.total}</div>
              </div>
            </div>

            {/* Audience Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Audience
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="verified">Verified Users Only</option>
                <option value="tenant">Tenants</option>
                <option value="landlord">Landlords</option>
                <option value="agent">Agents</option>
              </select>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Channel
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="email">Email (SMTP)</option>
                <option value="sms">SMS</option>
                <option value="push">Push (coming soon)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                placeholder="Enter your message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32"
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSend}
                disabled={sending}
                className={`px-4 py-2 rounded-md text-white font-medium
                  ${sending 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
              >
                {sending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Broadcast'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
} 