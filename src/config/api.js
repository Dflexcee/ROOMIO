// Centralized API Configuration
const config = {
    // API Base URL from environment variable
    API_BASE: import.meta.env.VITE_API_BASE || 'http://localhost/roomio/php-api/public',
    
    // App Information
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Roomio',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // API Endpoints (all relative to API_BASE)
    endpoints: {
      // Auth endpoints
      auth: {
        register: '/auth/register.php',
        login: '/auth/login.php',
        logout: '/auth/logout.php',
        me: '/auth/me.php'
      },
      
      // Profile endpoints
      profile: {
        update: '/profile/update-fixed.php'
      },
      
      // Room endpoints
      rooms: {
        list: '/rooms/list.php',
        mine: '/rooms/mine.php',
        create: '/rooms/create.php',
        update: '/rooms/update.php',
        delete: '/rooms/delete.php',
        get: '/rooms/get-simple.php',
        posters: '/rooms/posters.php'
      },
      
    // Admin endpoints
    admin: {
      stats: '/admin/stats-working.php',
      users: '/admin/users-clean.php',
      tickets: '/admin/tickets.php',
      emailTemplates: '/admin/email-templates.php',
      smtpSettings: '/admin/smtp-settings.php',
      smtpTest: '/admin/smtp-test.php',
      smsSettings: '/admin/sms-settings.php',
      broadcast: '/admin/broadcast.php',
      listings: '/admin/listings-management.php',
      currency: '/admin/currency-management.php',
      roomStatus: '/admin/rooms/status.php',
      postingAccess: '/admin/posting-access.php',
      verificationRequests: '/admin/verification-requests.php',
      verificationRequestsFallback: '/admin/verification-requests-fallback.php',
      verificationReview: '/admin/verification-review.php',
      verificationActions: '/admin/verification-actions.php',  // NEW: Verification-only actions
      verificationSettings: '/admin/verification-settings.php',
      verifyUser: '/admin/verify-user.php',
      roomsManagement: '/admin/rooms-management.php',  // NEW: Room listings management
      listingsActions: '/admin/listings-actions.php',  // NEW: All listings management
      bannedUsers: '/admin/banned-users.php',
      systemLogs: '/admin/system-logs.php',
      banUser: '/admin/ban-user.php',
      ads: '/admin/ads.php'
    },
      
      // Payment endpoints
// Payment endpoints
        payments: {
          settings: '/payments-settings/list.php',
          checkAccess: '/access/check.php',
          create: '/payment-settings/create.php',
          update: '/payment-settings/update.php',
          toggleLock: '/payment-settings/toggle-lock.php'
        },
      
      // Scam alerts
      scamAlerts: {
        list: '/scam-alerts/list.php',
        create: '/scam-alerts/create.php'
      },
      
      // Users
      users: {
        list: '/users/list.php',
        get: '/users/get.php',
        withPosts: '/users/with-posts.php'
      },

      // Messages
      messages: {
        list: '/messages/list.php',
        send: '/messages/send.php'
      },

      // Typing indicators
      typingIndicators: {
        update: '/typing-indicators/update.php'
      },

      // File uploads
      upload: {
        avatar: '/upload/avatar.php',
        roomImage: '/upload/room-image.php',
        chatFile: '/upload/chat-file.php',
        adImage: '/upload/ad-image.php'
      },

      // Community posts
      communityPosts: {
        list: '/community-posts/list.php',
        create: '/community-posts/create.php',
        comment: '/community-posts/comment.php'
      },

      // Verification endpoints
      verification: {
        submit: '/verification/submit.php',
        status: '/verification/status.php'
      },

      // Tickets endpoints (Help Center)
      tickets: {
        list: '/tickets/list.php',
        create: '/tickets/create.php',
        get: '/tickets/get.php',
        reply: '/tickets/reply.php'
      },

      // Listings endpoints (Multi-property posts)
      listings: {
        create: '/listings/create.php',
        list: '/listings/list.php',
        mine: '/listings/mine.php',
        update: '/listings/update.php',
        delete: '/listings/delete.php'
      }
    },
    
    // Helper function to get full URL
    getUrl: (endpoint) => {
      return `${config.API_BASE}${endpoint}`;
    },
    
    // Helper function to get auth headers
    getAuthHeaders: () => {
      return {
        'Content-Type': 'application/json',
        'credentials': 'include'
      };
    }
  };
  
  export default config;