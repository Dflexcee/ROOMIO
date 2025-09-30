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
        create: '/rooms/create-fixed.php',
        update: '/rooms/update.php',
        delete: '/rooms/delete.php',
        get: '/rooms/get-simple.php'
      },
      
    // Admin endpoints
    admin: {
      stats: '/admin/stats-working.php',
      users: '/admin/users-clean.php',
      tickets: '/admin/tickets.php',
      emailTemplates: '/admin/email-templates.php',
      smtpSettings: '/admin/smtp-settings.php',
      smsSettings: '/admin/sms-settings.php',
      broadcast: '/admin/broadcast.php',
      listings: '/admin/listings-management.php',
      currency: '/admin/currency-management.php',
      roomStatus: '/admin/rooms/status.php',
      verificationRequests: '/admin/verification-requests.php',
      verificationRequestsFallback: '/admin/verification-requests-fallback.php',
      verificationReview: '/admin/verification-review.php',
      verificationActions: '/admin/verification-actions.php',  // NEW: Verification-only actions
      verifyUser: '/admin/verify-user.php',
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
        get: '/users/get.php'
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