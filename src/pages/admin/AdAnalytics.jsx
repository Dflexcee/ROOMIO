import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config/api.js';
import PageWrapper from '../../components/common/PageWrapper';

export default function AdAnalytics() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [adId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getUrl(`/admin/ad-analytics.php?ad_id=${adId}`), {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
          <button
            onClick={() => navigate('/admin/ads')}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ← Back to Ads
          </button>
        </div>
      </PageWrapper>
    );
  }

  const { ad, summary, clicks_by_user, impressions_by_user, hourly_clicks, hourly_impressions, daily_clicks, daily_impressions, top_hours, conversions } = analytics;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/ads')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Back to Ads
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Ad Analytics</h1>
              <p className="text-xl text-gray-600 mt-2">{ad.title}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded text-sm font-semibold ${
                ad.active === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {ad.active === 1 ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Impressions</div>
            <div className="text-3xl font-bold text-blue-600">{summary.total_impressions.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{summary.unique_viewers} unique viewers</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold text-green-600">{summary.total_clicks.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{summary.unique_clickers} unique clickers</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Click-Through Rate</div>
            <div className="text-3xl font-bold text-purple-600">{summary.ctr}%</div>
            <div className="text-xs text-gray-500 mt-1">Clicks / Impressions</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Avg Clicks/User</div>
            <div className="text-3xl font-bold text-orange-600">
              {summary.unique_clickers > 0 ? (summary.total_clicks / summary.unique_clickers).toFixed(1) : '0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Engagement rate</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Conversions</div>
            <div className="text-3xl font-bold text-pink-600">
              {conversions.reduce((sum, c) => sum + parseInt(c.count), 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ${conversions.reduce((sum, c) => sum + parseFloat(c.total_revenue || 0), 0).toFixed(2)} revenue
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              {['overview', 'clicks', 'impressions', 'time-analysis'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Top Performing Hours</h3>
                  <div className="space-y-2">
                    {top_hours.map((hourData, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="font-medium">
                          {hourData.hour}:00 - {hourData.hour}:59
                        </span>
                        <span className="text-blue-600 font-semibold">{hourData.clicks} clicks</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Daily Performance (Last 30 Days)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Date</th>
                          <th className="px-4 py-2 text-right font-semibold">Impressions</th>
                          <th className="px-4 py-2 text-right font-semibold">Clicks</th>
                          <th className="px-4 py-2 text-right font-semibold">CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daily_impressions.map((impData) => {
                          const clickData = daily_clicks.find(c => c.date === impData.date);
                          const clicks = clickData ? parseInt(clickData.clicks) : 0;
                          const impressions = parseInt(impData.impressions);
                          const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

                          return (
                            <tr key={impData.date} className="border-t border-gray-200">
                              <td className="px-4 py-2">{formatDateShort(impData.date)}</td>
                              <td className="px-4 py-2 text-right">{impressions.toLocaleString()}</td>
                              <td className="px-4 py-2 text-right">{clicks.toLocaleString()}</td>
                              <td className="px-4 py-2 text-right">{ctr}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Clicks Tab */}
            {activeTab === 'clicks' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Clicks by User</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">User</th>
                        <th className="px-4 py-2 text-left font-semibold">Email</th>
                        <th className="px-4 py-2 text-right font-semibold">Clicks</th>
                        <th className="px-4 py-2 text-left font-semibold">First Click</th>
                        <th className="px-4 py-2 text-left font-semibold">Last Click</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clicks_by_user.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            No clicks yet
                          </td>
                        </tr>
                      ) : (
                        clicks_by_user.map((user, idx) => (
                          <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2">{user.user_name || 'Anonymous'}</td>
                            <td className="px-4 py-2">{user.user_email || 'N/A'}</td>
                            <td className="px-4 py-2 text-right font-semibold text-green-600">
                              {user.click_count}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatDate(user.first_click)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatDate(user.last_click)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Impressions Tab */}
            {activeTab === 'impressions' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Impressions by User</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">User</th>
                        <th className="px-4 py-2 text-left font-semibold">Email</th>
                        <th className="px-4 py-2 text-right font-semibold">Views</th>
                        <th className="px-4 py-2 text-left font-semibold">First View</th>
                        <th className="px-4 py-2 text-left font-semibold">Last View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impressions_by_user.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            No impressions yet
                          </td>
                        </tr>
                      ) : (
                        impressions_by_user.map((user, idx) => (
                          <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2">{user.user_name || 'Anonymous'}</td>
                            <td className="px-4 py-2">{user.user_email || 'N/A'}</td>
                            <td className="px-4 py-2 text-right font-semibold text-blue-600">
                              {user.impression_count}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatDate(user.first_view)}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatDate(user.last_view)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Time Analysis Tab */}
            {activeTab === 'time-analysis' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hourly Activity (Last 24 Hours)</h3>
                  <div className="space-y-2">
                    {hourly_impressions.length === 0 && hourly_clicks.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No activity in the last 24 hours</div>
                    ) : (
                      <>
                        {hourly_impressions.map((hourData, idx) => {
                          const clickData = hourly_clicks.find(c => c.hour === hourData.hour);
                          const clicks = clickData ? parseInt(clickData.clicks) : 0;
                          const impressions = parseInt(hourData.impressions);

                          return (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{new Date(hourData.hour).toLocaleString()}</span>
                                <span className="text-sm text-gray-600">
                                  {impressions} views • {clicks} clicks
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1 bg-blue-200 rounded-full h-2"
                                     style={{width: `${(impressions / summary.total_impressions) * 100}%`}}>
                                </div>
                                <div className="flex-1 bg-green-200 rounded-full h-2"
                                     style={{width: `${clicks > 0 ? (clicks / summary.total_clicks) * 100 : 0}%`}}>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
