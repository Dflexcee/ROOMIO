// Admin Configuration
const adminConfig = {
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Roomio',
  ADMIN_TITLE: import.meta.env.VITE_ADMIN_TITLE || 'Roomio Admin',
  
  // Navigation Configuration
  navigation: {
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "manager"] },
      { path: "/admin/users", label: "Users", icon: "👥", roles: ["admin", "manager"] },
      { path: "/admin/listings", label: "Listings", icon: "🏠", roles: ["admin", "manager"] },
      { path: "/admin/tickets", label: "Tickets", icon: "🎫", roles: ["admin", "manager"] },
      { path: "/admin/email-templates", label: "Email Templates", icon: "📧", roles: ["admin", "manager"] },
      { path: "/admin/ads", label: "Ads Manager", icon: "📢", roles: ["admin", "manager"] },
      { path: "/admin/payments", label: "Payment Settings", icon: "💰", roles: ["admin"] },
      { path: "/admin/user-access", label: "User Access", icon: "🔐", roles: ["admin"] },
      { path: "/admin/grant-access", label: "Grant Feature Access", icon: "🎁", roles: ["admin"] },
      { path: "/admin/verification", label: "Agent Verification", icon: "✅", roles: ["admin"] },
      { path: "/admin/broadcast", label: "Broadcast", icon: "📡", roles: ["admin"] },
      { path: "/admin/analytics", label: "Analytics", icon: "📈", roles: ["admin"] },
      { path: "/admin/blacklist", label: "Blacklist / Logs", icon: "🚫", roles: ["admin"] },
      { path: "/admin/smtp-settings", label: "SMTP Settings", icon: "📨", roles: ["admin"] },
      { path: "/admin/sms-settings", label: "SMS Settings", icon: "📱", roles: ["admin"] },
      { path: "/admin/currency-settings", label: "Currency Settings", icon: "💰", roles: ["admin"] },
      { path: "/admin/admin-manager-details", label: "Admin & Manager Details", icon: "🛡️", roles: ["admin"] },
    ]
  },

  // Email Template Test Variables
  emailTestVariables: {
    user_name: import.meta.env.VITE_TEST_USER_NAME || "Test User",
    room_link: import.meta.env.VITE_TEST_ROOM_LINK || "https://example.com/room/123",
    listing_title: import.meta.env.VITE_TEST_LISTING_TITLE || "Test Listing",
    interested_user_name: import.meta.env.VITE_TEST_INTERESTED_USER_NAME || "Interested User",
    interested_user_email: import.meta.env.VITE_TEST_INTERESTED_USER_EMAIL || "interested@example.com",
    interested_user_phone: import.meta.env.VITE_TEST_INTERESTED_USER_PHONE || "+1234567890"
  },

  // SMTP Placeholder Examples
  smtpExamples: {
    host: import.meta.env.VITE_SMTP_HOST_EXAMPLE || "smtp.gmail.com",
    fromEmail: import.meta.env.VITE_SMTP_FROM_EXAMPLE || "noreply@yourdomain.com"
  },

  // Admin Dashboard Configuration
  dashboard: {
    widgets: [
      { key: "total_users", label: "👥 Total Users", color: "blue" },
      { key: "verified_users", label: "✅ Verified Users", color: "green" },
      { key: "new_users", label: "🆕 New This Week", color: "purple" },
      { key: "total_rooms", label: "🏘️ Rooms Posted", color: "indigo" },
      { key: "flagged_rooms", label: "🚩 Flagged Rooms", color: "red" },
      { key: "open_tickets", label: "📩 Open Tickets", color: "orange" },
      { key: "pending_verifications", label: "🧍 Pending Verifications", color: "yellow" }
    ]
  },

  // User Management Configuration
  userManagement: {
    statusOptions: [
      { value: "all", label: "All Statuses" },
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "banned", label: "Banned" }
    ],
    verificationOptions: [
      { value: "all", label: "All Users" },
      { value: "verified", label: "Verified Only" },
      { value: "unverified", label: "Unverified Only" }
    ]
  },

  // Broadcast Configuration
  broadcast: {
    audienceOptions: [
      { value: "all", label: "All Users" },
      { value: "verified", label: "Verified Users Only" },
      { value: "tenant", label: "Tenants" },
      { value: "landlord", label: "Landlords" },
      { value: "agent", label: "Agents" }
    ],
    channelOptions: [
      { value: "email", label: "Email (SMTP)" },
      { value: "sms", label: "SMS" },
      { value: "push", label: "Push (coming soon)" }
    ]
  },

  // Analytics Configuration
  analytics: {
    chartLabels: ["Tenants", "Landlords", "Agents", "Rooms", "Tickets"],
    chartColors: ["#3b82f6", "#f59e42", "#10b981", "#6366f1", "#ef4444"]
  },

  // Helper Functions
  getNavigationItems: (userRole) => {
    return adminConfig.navigation.items.filter(item => 
      item.roles.includes(userRole)
    );
  },

  getDashboardWidgets: () => {
    return adminConfig.dashboard.widgets;
  },

  getEmailTestVariables: () => {
    return adminConfig.emailTestVariables;
  },

  getSMTPExamples: () => {
    return adminConfig.smtpExamples;
  }
};

export default adminConfig;
