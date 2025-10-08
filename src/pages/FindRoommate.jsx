import React, { useEffect, useState } from "react";
import config from "../config/api";
import { useCurrency } from "../contexts/CurrencyContext";
import Navbar from "../components/common/Navbar";
import DarkModeToggle from "../components/common/DarkModeToggle";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import LazyImage from "../components/common/LazyImage";

export default function FindRoommate() {
  const { currency } = useCurrency();
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAllPostsModal, setShowAllPostsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postType, setPostType] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getUrl(config.endpoints.users.list), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      // Parse images for rooms and listings
      const usersWithParsedImages = (data.users || []).map(user => {
        if (user.rooms && Array.isArray(user.rooms)) {
          user.rooms = user.rooms.map(room => ({
            ...room,
            images: typeof room.images === 'string' ? JSON.parse(room.images || '[]') : (Array.isArray(room.images) ? room.images : [])
          }));
        }
        if (user.listings && Array.isArray(user.listings)) {
          user.listings = user.listings.map(listing => ({
            ...listing,
            images: typeof listing.images === 'string' ? JSON.parse(listing.images || '[]') : (Array.isArray(listing.images) ? listing.images : [])
          }));
        }
        return user;
      });

      setUsers(usersWithParsedImages);
    } catch (error) {
      setError('Error: ' + error.message);
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user avatar URL
  const getUserAvatar = (user) => {
    if (!user) return null;

    // If avatar_url exists and is complete, use it
    if (user.avatar_url && user.avatar_url.includes('.')) {
      return user.avatar_url;
    }

    // If avatar_url is incomplete, try to construct it
    if (user.avatar_url) {
      // Check if there are any avatar files for this user
      return user.avatar_url;
    }

    // Return null to show fallback
    return null;
  };

  const getCardsPerPage = () => {
    if (window.innerWidth < 768) return 1; // Mobile: 1 card
    return 4; // Desktop: 4 cards
  };

  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage());

  useEffect(() => {
    const handleResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + cardsPerPage, users.length - cardsPerPage));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - cardsPerPage, 0));
  };

  const handleChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const handleViewPost = (post, type) => {
    setSelectedPost(post);
    setPostType(type);
    setImageIndex(0);
    setShowPostModal(true);
  };

  const handleViewAllPosts = (user) => {
    setSelectedUser(user);
    setShowAllPostsModal(true);
  };

  const handleViewPosts = (user) => {
    // Check if user has any posts
    const totalPosts = (user.total_posts || 0) + (user.total_rooms || 0) + (user.total_listings || 0);

    if (totalPosts === 0) {
      alert('This user has not posted anything yet.');
      return;
    }

    // If more than 1 total post, show all posts modal
    if (totalPosts > 1) {
      handleViewAllPosts(user);
      return;
    }

    // Single post - open directly
    if (user.rooms && user.rooms.length > 0) {
      handleViewPost(user.rooms[0], 'room');
    } else if (user.listings && user.listings.length > 0) {
      handleViewPost(user.listings[0], 'listing');
    }
  };

  // All Posts Modal
  const AllPostsModal = ({ user, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {user.full_name}'s Posts
        </h2>

        {/* Rooms */}
        {user.total_rooms > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
              🏠 Rooms ({user.total_rooms})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.rooms.map(room => (
                <div key={room.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{room.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{currency.currency_symbol}{Number(room.rent).toLocaleString()}/month</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">{room.location}</p>
                  <button
                    onClick={() => {
                      onClose();
                      handleViewPost(room, 'room');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings */}
        {user.total_listings > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-3">
              📋 Listings ({user.total_listings})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.listings.map(listing => (
                <div key={listing.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{listing.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{currency.currency_symbol}{Number(listing.price).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 capitalize">{listing.type} - {listing.location}</p>
                  <button
                    onClick={() => {
                      onClose();
                      handleViewPost(listing, 'listing');
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Post Detail Modal
  const PostModal = ({ post, type, onClose }) => {
    // Debug logging
    console.log('PostModal - Post data:', post);
    console.log('PostModal - Type:', type);

    // Validate post data
    if (!post) {
      console.error('PostModal: No post data provided');
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">Error</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Post data is missing</p>
            <button onClick={onClose} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      );
    }

    const images = Array.isArray(post.images) && post.images.length > 0
      ? post.images
      : ['/default-room.jpg'];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl z-10"
            onClick={onClose}
          >
            ×
          </button>

          {/* Image Carousel */}
          <div className="mb-6">
            <LazyImage
              src={images[imageIndex] || '/default-room.jpg'}
              alt={post.title || 'Post image'}
              className="w-full h-96 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
              fallback="/default-room.jpg"
            />
            {images.length > 1 && (
              <>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300 font-semibold">
                    {imageIndex + 1} / {images.length}
                  </span>
                  <button
                    onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Next →
                  </button>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <LazyImage
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                        idx === imageIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                      onClick={() => setImageIndex(idx)}
                      fallback="/default-room.jpg"
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Post Details */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {post.title}
            </h2>

            {type === 'room' ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-blue-600 dark:text-blue-400">Rent:</strong>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currency.currency_symbol}{Number(post.rent || 0).toLocaleString()}/month
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-gray-600 dark:text-gray-400">Location:</strong>
                    <div className="text-gray-900 dark:text-white">{post.location || 'N/A'}</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-purple-600 dark:text-purple-400">Gender:</strong>
                    <div className="text-gray-900 dark:text-white capitalize">{post.gender_preference || 'Any'}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-green-600 dark:text-green-400">Role:</strong>
                    <div className="text-gray-900 dark:text-white">{post.role || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <strong className="text-gray-700 dark:text-gray-300">Description:</strong>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                    {post.description || 'No description provided'}
                  </p>
                </div>

                {post.conditions && (
                  <div className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg">
                    <strong className="text-yellow-700 dark:text-yellow-400">Conditions:</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{post.conditions}</p>
                  </div>
                )}

                {post.amenities && Array.isArray(post.amenities) && post.amenities.length > 0 && (
                  <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                    <strong className="text-blue-700 dark:text-blue-400">Amenities:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-green-600 dark:text-green-400">Price:</strong>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currency.currency_symbol}{Number(post.price).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-blue-600 dark:text-blue-400">Type:</strong>
                    <div className="text-gray-900 dark:text-white capitalize">{post.type}</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg col-span-2">
                    <strong className="text-purple-600 dark:text-purple-400">Location:</strong>
                    <div className="text-gray-900 dark:text-white">{post.location}</div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <strong className="text-gray-700 dark:text-gray-300">Description:</strong>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                    {post.description}
                  </p>
                </div>

                {post.contact_phone && (
                  <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-blue-700 dark:text-blue-400">Contact Phone:</strong>
                    <div className="text-gray-900 dark:text-white">{post.contact_phone}</div>
                  </div>
                )}

                {post.contact_email && (
                  <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
                    <strong className="text-purple-700 dark:text-purple-400">Contact Email:</strong>
                    <div className="text-gray-900 dark:text-white">{post.contact_email}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                onClose();
                const ownerId = post?.user_id || selectedUser?.id;
                if (ownerId) {
                  handleChat(ownerId);
                }
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              💬 Chat with Owner
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="flex justify-center pt-4">
          <DarkModeToggle />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">No users with posts found.</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-7xl">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white mb-4 sm:mb-6 lg:mb-8">
            🔍 Find Roommate
          </h1>

          {/* Cards Grid - Single column on mobile for full image display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-md mx-auto sm:max-w-none">
            {users.slice(currentIndex, currentIndex + cardsPerPage).map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Avatar with gradient overlay - TALL on mobile for full image visibility */}
                <div className="relative h-96 sm:h-80 lg:h-96 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center overflow-hidden">
                  {/* Default avatar icon as background placeholder */}
                  {!getUserAvatar(user) && (
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-60">
                      <svg className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {getUserAvatar(user) && (
                    <LazyImage
                      src={getUserAvatar(user)}
                      alt={user.full_name}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      fallback="/default-room.jpg"
                    />
                  )}

                  {/* Fallback avatar icon (shown on error) */}
                  <div className="avatar-fallback hidden absolute inset-0 flex items-center justify-center text-white">
                    <svg className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Overlay gradient for better visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* User name overlay at bottom - Responsive Text */}
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg truncate">
                      {user.full_name}
                    </h3>
                  </div>

                  {/* Post badge - Responsive */}
                  {(user.total_posts > 0) && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 dark:bg-gray-800/90 text-purple-600 dark:text-purple-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-sm">
                      {user.total_posts} {user.total_posts === 1 ? 'Post' : 'Posts'}
                    </div>
                  )}
                </div>

                {/* Info - Responsive Padding */}
                <div className="p-3 sm:p-4 space-y-2">

                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {user.university && <div>🎓 {user.university}</div>}
                    {user.gender && <div className="capitalize">👤 {user.gender}</div>}
                  </div>

                  {user.about_me && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                      {user.about_me}
                    </p>
                  )}

                  {/* Posts Summary - only show if user has posts */}
                  {((user.total_rooms || 0) + (user.total_listings || 0) > 0) && (
                    <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded text-xs">
                      {user.total_rooms > 0 && (
                        <div className="text-blue-600 dark:text-blue-400">
                          🏠 {user.total_rooms} Room{user.total_rooms > 1 ? 's' : ''}
                        </div>
                      )}
                      {user.total_listings > 0 && (
                        <div className="text-green-600 dark:text-green-400">
                          📋 {user.total_listings} Listing{user.total_listings > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="space-y-2 pt-2">
                    {((user.total_rooms || 0) + (user.total_listings || 0) > 0) && (
                      <Button
                        onClick={() => handleViewPosts(user)}
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon="📋"
                      >
                        {(user.total_posts || 0) > 1 ? 'View All Posts' : 'View Post'}
                      </Button>
                    )}
                    <Button
                      onClick={() => handleChat(user.id)}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon="💬"
                    >
                      Chat
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation - Responsive */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              <span className="hidden sm:inline">← Previous</span>
              <span className="sm:hidden">←</span>
            </button>

            <div className="text-white font-semibold text-sm sm:text-base">
              Page {Math.floor(currentIndex / cardsPerPage) + 1} / {Math.ceil(users.length / cardsPerPage)}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex + cardsPerPage >= users.length}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAllPostsModal && selectedUser && (
        <AllPostsModal
          user={selectedUser}
          onClose={() => setShowAllPostsModal(false)}
        />
      )}

      {showPostModal && selectedPost && (
        <PostModal
          post={selectedPost}
          type={postType}
          onClose={() => setShowPostModal(false)}
        />
      )}
    </div>
  );
}
