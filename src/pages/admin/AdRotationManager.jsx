import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/common/Navbar';
import config from '../../config/api';

/**
 * Admin Panel for Managing Ad Rotation
 * Allows admins to:
 * - View all ads grouped by type
 * - See rotation order (priority-based)
 * - Adjust ad priority for rotation control
 * - View performance metrics in real-time
 * - Control ad timing and display frequency
 */
export default function AdRotationManager() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [groupedAds, setGroupedAds] = useState({});
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchAds();
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchAds, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAds = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(config.getUrl('/admin/ads/list.php'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setAds(data.ads);

        // Group ads by type
        const grouped = data.ads.reduce((acc, ad) => {
          if (!acc[ad.ad_type]) {
            acc[ad.ad_type] = [];
          }
          acc[ad.ad_type].push(ad);
          return acc;
        }, {});

        // Sort each group by priority (DESC) then by created date
        Object.keys(grouped).forEach(type => {
          grouped[type].sort((a, b) => {
            if (b.priority !== a.priority) {
              return b.priority - a.priority;
            }
            return new Date(b.created_at) - new Date(a.created_at);
          });
        });

        setGroupedAds(grouped);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const updatePriority = async (adId, newPriority) => {
    try {
      const response = await fetch(config.getUrl('/admin/ads/update-priority.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ad_id: adId, priority: parseInt(newPriority) })
      });

      const data = await response.json();
      if (data.success) {
        fetchAds(); // Refresh to show new order
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const calculateCTR = (ad) => {
    if (!ad.impressions || ad.impressions === 0) return '0.00';
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
  };

  const getAdTypeColor = (type) => {
    const colors = {
      banner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      popup: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sidebar: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      slide: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getFrequencyBadge = (frequency) => {
    const badges = {
      always: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      once_per_session: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      once_per_day: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    const labels = {
      always: 'Always',
      once_per_session: 'Per Session',
      once_per_day: 'Per Day'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[frequency] || ''}`}>
        {labels[frequency] || frequency}
      </span>
    );
  };

  const adsToDisplay = selectedType === 'all' ? ads : (groupedAds[selectedType] || []);
  const adTypes = ['all', ...Object.keys(groupedAds)];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900">
      <Navbar />

      <div className="flex-1 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 mb-6 border border-blue-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-extrabold text-blue-700 dark:text-pink-400">
                  🔄 Ad Rotation Manager
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Control how your 100+ ads display, rotate, and perform
                </p>
              </div>
              <button
                onClick={fetchAds}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Ads</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{ads.length}</div>
              </div>
              <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Ads</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {ads.filter(ad => ad.active).length}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Impressions</div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {ads.reduce((sum, ad) => sum + (parseInt(ad.impressions) || 0), 0)}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {ads.reduce((sum, ad) => sum + (parseInt(ad.clicks) || 0), 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 mb-6 border border-blue-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {adTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type !== 'all' && (
                    <span className="ml-2 px-2 py-0.5 bg-white dark:bg-gray-900 text-xs rounded-full">
                      {groupedAds[type]?.length || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ads Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-blue-100 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Frequency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Impressions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Clicks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">CTR</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {adsToDisplay.map((ad, index) => (
                    <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{ad.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {ad.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getAdTypeColor(ad.ad_type)}`}>
                          {ad.ad_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={ad.priority}
                          onChange={(e) => updatePriority(ad.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                          min="1"
                          max="100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {getFrequencyBadge(ad.display_frequency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        {ad.impressions || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        {ad.clicks || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {calculateCTR(ad)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ad.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {ad.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {adsToDisplay.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No ads found for this type
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-6 mt-6 border border-blue-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
              💡 How Ad Rotation Works
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Priority</strong>: Higher priority ads show first (100 = highest, 1 = lowest)</li>
              <li>• <strong>Order</strong>: Ads are sorted by priority (DESC), then by creation date</li>
              <li>• <strong>Frequency</strong>:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>- <em>Always</em>: Shows on every page load</li>
                  <li>- <em>Per Session</em>: Shows once per 4-hour session</li>
                  <li>- <em>Per Day</em>: Shows once per 24 hours</li>
                </ul>
              </li>
              <li>• <strong>Real-time Updates</strong>: This page auto-refreshes every 10 seconds</li>
              <li>• <strong>Adjust Priority</strong>: Change the number and press Tab/Enter to update rotation order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
