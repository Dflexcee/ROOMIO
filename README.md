# Roomio

A comprehensive room rental and property listing platform built with React and PHP.

## 🏗️ Architecture Overview

**Roomio** is a full-stack web application for room rentals, roommate matching, and property listings.

### Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + React Router
- **Backend**: PHP (vanilla) with PDO for MySQL
- **Database**: MySQL (via XAMPP)
- **Authentication**: PHP sessions with cookie-based auth
- **UI Components**: Heroicons, Framer Motion, Chart.js

---

## 📁 Project Structure

```
roomio/
├── src/                          # React frontend
│   ├── pages/                    # Page components
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── FindRoom.jsx         # Browse room listings
│   │   ├── FindRoommate.jsx     # Browse roommate profiles
│   │   ├── PostRoom.jsx         # Create room listings
│   │   ├── PostListing.jsx      # Create property listings
│   │   ├── MyRooms.jsx          # Manage user's rooms
│   │   ├── MyListings.jsx       # Manage user's listings
│   │   ├── ChatDetail.jsx       # Chat messaging
│   │   ├── ScamBoard.jsx        # Community scam alerts
│   │   └── HelpCenter.jsx       # Support tickets
│   ├── components/              # Reusable components
│   │   ├── common/              # Shared UI components
│   │   ├── admin/               # Admin-specific components
│   │   └── user/                # User-specific components
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.jsx      # User authentication state
│   │   └── CurrencyContext.jsx  # Currency settings
│   ├── config/
│   │   └── api.js               # API endpoints configuration
│   └── routes/
│       └── AppRoutes.jsx        # Route definitions
│
├── php-api/                     # PHP backend
│   ├── public/                  # API endpoints
│   │   ├── auth/               # Login/register/logout
│   │   ├── rooms/              # Room CRUD operations
│   │   ├── listings/           # Property listings CRUD
│   │   ├── messages/           # Chat system
│   │   ├── admin/              # Admin endpoints
│   │   ├── tickets/            # Help center tickets
│   │   ├── verification/       # User verification
│   │   └── upload/             # File uploads
│   ├── lib/
│   │   ├── Auth.php            # Authentication helpers
│   │   └── Config.php          # Configuration
│   ├── middleware/
│   │   └── check-user-status.php  # User status validation
│   └── config.php              # Database connection
```

---

## 🎯 Core Features

### User Features
- **Authentication**: Registration, login, logout with PHP sessions
- **Profile Management**: Complete profile with avatar, bio, preferences
- **Room Listings**: Post/browse/manage room rentals (requires verification)
- **Property Listings**: Post land/house/car/other properties (requires verification)
- **Roommate Search**: Browse user profiles to find compatible roommates
- **Chat System**: Real-time messaging between users with file attachments
- **Scam Board**: Community-driven scam alerts and warnings
- **Help Center**: Support ticket system for user issues
- **Community Feed**: Social posts and comments

### Admin Features
- **Dashboard**: Statistics (users, rooms, verifications, tickets)
- **User Management**: View, verify, ban, suspend users
- **Verification System**: Approve/reject verification requests (global, rooms-only, listings-only)
- **Room Listings Management**: Approve/reject/suspend room posts
- **Property Listings Management**: Approve/reject/suspend property listings
- **Ticket Management**: Handle support tickets
- **Broadcast**: Send mass emails/SMS to users
- **Ads Manager**: Manage advertisements (banner/sidebar/popup)
- **Currency Settings**: Configure currency (default: NGN ₦)
- **SMTP/SMS Settings**: Configure email and SMS gateways
- **Email Templates**: Manage email templates
- **System Logs**: Track admin actions and user activities
- **Posting Access Control**: Grant/revoke posting permissions per user

---

## 🔐 Verification & Access Control System

Roomio implements a sophisticated two-tier access control system:

### A. Account Status (Controls App Access)
- `active` - Normal access to all features
- `banned` - Completely blocked from the application
- `suspended` - Temporarily blocked from the application
- `inactive` - Deactivated account

### B. Verification Status (Controls Posting Ability)
- `unverified` - Can browse but cannot post
- `pending` - Verification submitted, awaiting admin review
- `verified/approved` - Can post rooms and listings
- `rejected` - Verification denied, can resubmit
- `suspended` - Verification revoked, can browse but not post

### Granular Posting Permissions
- `verified_for_rooms` - Can post room listings only
- `verified_for_listings` - Can post property listings only
- Global verification - Grants both permissions

**Key Design Philosophy:**
- **Account status** blocks entire app access (banned/suspended users cannot login)
- **Verification status** only blocks posting (unverified users can still browse, chat, use help center)
- Admins and managers bypass all restrictions

---

## 💾 Database Schema

### Key Tables

#### `users`
User accounts with profile data, authentication, and permissions
- **Authentication**: `email`, `password`
- **Profile**: `full_name`, `age`, `gender`, `university`, `avatar_url`, `phone`
- **Status**: `status`, `verification_status`, `role`
- **Posting Permissions**: `can_post_rooms`, `can_post_listings`, `verified_for_rooms`, `verified_for_listings`

#### `rooms`
Room rental listings
- **Details**: `title`, `description`, `location`, `rent`, `gender_preference`
- **Media**: `images` (JSON), `amenities` (JSON)
- **Moderation**: `status` (pending/approved/rejected/suspended), `status_reason`

#### `listings`
Property listings for land, houses, cars, and other items
- **Type**: `type` (enum: land, house, car, other)
- **Details**: `title`, `description`, `price`, `location`
- **Media**: `images` (JSON), `specifications` (JSON)
- **Contact**: `contact_phone`, `contact_email`
- **Moderation**: `status`, `status_reason`, `status_changed_by`

#### `messages`
Chat system for user communication
- **Core**: `sender_id`, `receiver_id`, `content`
- **Files**: `file_name`, `file_type`, `file_url`
- **Status**: `is_read`, `created_at`

#### `tickets` & `ticket_responses`
Support ticket system
- **Tickets**: `user_id`, `subject`, `message`, `status`, `priority`
- **Responses**: `ticket_id`, `user_id`, `message`, `is_admin`

#### Other Tables
- `ads` - Advertisement management with click/impression tracking
- `scam_alerts` - Community scam warnings
- `community_posts` & `post_comments` - Social feed
- `smtp_settings`, `email_templates` - Email configuration
- `system_logs` - Admin action tracking

---

## 🔌 API Architecture

### Authentication Flow
1. User logs in → `/auth/login.php` creates PHP session
2. Session cookie sent with all requests (`credentials: 'include'`)
3. Protected endpoints call `require_auth($pdo)`
4. Admin endpoints call `require_admin($pdo)`

### Key API Endpoints

#### Authentication
- `POST /auth/register.php` - User registration
- `POST /auth/login.php` - User login
- `GET /auth/me.php` - Get current user session
- `POST /auth/logout.php` - Logout and destroy session

#### Rooms
- `POST /rooms/create-fixed.php` - Create room (requires verification)
- `GET /rooms/list.php` - Browse all approved rooms
- `GET /rooms/mine.php` - User's own rooms
- `PUT /rooms/update.php` - Update room
- `DELETE /rooms/delete.php` - Delete room

#### Listings
- `POST /listings/create.php` - Create listing (requires verification)
- `GET /listings/list.php` - Browse all approved listings
- `GET /listings/mine.php` - User's own listings
- `PUT /listings/update.php` - Update listing
- `DELETE /listings/delete.php` - Delete listing

#### Messages
- `GET /messages/list.php` - Get user conversations
- `POST /messages/send.php` - Send message

#### Admin
- `GET /admin/stats-working.php` - Dashboard statistics
- `GET /admin/users-clean.php` - User management
- `PUT /admin/verification-actions.php` - Approve/reject verifications
- `GET /admin/verification-requests.php` - Pending verification requests
- `PUT /admin/rooms-management.php` - Room moderation
- `PUT /admin/listings-actions.php` - Listing moderation
- `GET /admin/tickets.php` - Support ticket management
- `POST /admin/broadcast.php` - Send mass communications

---

## 🚀 Getting Started

### Prerequisites
- XAMPP (Apache + MySQL + PHP)
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   cd c:\xampp\htdocs
   git clone <repository-url> roomio
   cd roomio
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   - Start XAMPP (Apache + MySQL)
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Create database: `roomio`
   - Import SQL schema: Run `SAFE_DATABASE_SETUP.sql` or `RUN_ALL_FIXES_AND_SETUP.sql`

4. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update database credentials in `php-api/config.php` if needed

5. **Create admin user** (via phpMyAdmin SQL tab)
   ```sql
   INSERT INTO users (email, password, role, status, verification_status)
   VALUES ('admin@roomio.com', '$2y$10$YourHashedPasswordHere', 'admin', 'active', 'verified');
   ```
   Generate password hash:
   ```php
   <?php echo password_hash('your-password', PASSWORD_BCRYPT); ?>
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost/roomio/php-api/public

---

## 🎨 Frontend Architecture

### Routing
- **Public Routes**: `/`, `/login`, `/signup-login`, `/onboarding`
- **Protected Routes**: All user dashboard pages (requires authentication)
- **Admin Routes**: `/admin/*` (requires admin role)

### State Management
- **AuthContext**: User session, login/logout, user refresh
- **CurrencyContext**: Currency settings (default: NGN ₦)
- No Redux - using React Context API exclusively

### Key Components
- **PageWrapper**: Standard layout with navbar and sidebar
- **VerificationBlockModal**: Modal shown when unverified users try to post
- **VerificationFormNew**: Verification document submission form
- **UserStatusCheck**: Global component that monitors user account status

---

## 🔐 Security Features

1. **Password Security**: BCrypt hashing via `password_hash()` and `password_verify()`
2. **SQL Injection Prevention**: PDO prepared statements throughout entire API
3. **XSS Prevention**: JSON encoding for all API responses
4. **CSRF Protection**: Session-based with secure cookie handling
5. **Role-Based Access Control**: Strict admin vs user permissions
6. **Status Validation Middleware**: Automatic blocking of banned/suspended accounts
7. **File Upload Validation**: Type and size restrictions on uploads

---

## 📝 Development Guidelines

### Code Style
- **Frontend**: React functional components with hooks
- **Backend**: Procedural PHP with clear function separation
- **Database**: Prepared statements only, never raw SQL
- **Error Handling**: Try-catch blocks with proper error logging

### API Response Format
```json
{
  "success": true|false,
  "data": {},
  "error": "Error message if applicable",
  "status_code": "CUSTOM_ERROR_CODE"
}
```

### Database Migrations
- Add new SQL files for schema changes
- Never modify production data directly
- Always use `IF NOT EXISTS` or `ADD COLUMN IF NOT EXISTS`

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Room listing creation (with verification check)
- [ ] Property listing creation (with verification check)
- [ ] Chat messaging and file attachments
- [ ] Admin verification approval/rejection
- [ ] Admin user banning/suspension
- [ ] Ticket creation and responses

### Test Users
Create test accounts with different roles and statuses to verify access control.

---

## 🐛 Known Issues & Future Improvements

### Needs Integration
- [ ] Email sending via configured SMTP
- [ ] SMS sending integration
- [ ] Email templates in actual email sending
- [ ] Dynamic search filters (backend implementation)
- [ ] Real-time chat notifications
- [ ] Push notifications

### Cleanup Needed
- [ ] Remove test files (`test-*.php`, `test-*.html`)
- [ ] Remove old SQL migration files
- [ ] Remove backup files (*-backup, *-old, *-working)
- [ ] Consolidate documentation files

---

## 📚 Additional Documentation

- **START_HERE_README.md** - Quick start guide with immediate action items
- **IMPLEMENTATION_PLAN.md** - Detailed implementation roadmap
- **DATABASE_SETUP_GUIDE.md** - Database configuration instructions
- **PHPMAILER_SETUP_GUIDE.md** - Email configuration guide

---

## 🤝 Contributing

1. Create a new branch for features
2. Follow existing code style and conventions
3. Test thoroughly before committing
4. Document new features and API endpoints
5. Update this README with significant changes

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Support

For issues, questions, or feature requests:
1. Check browser console for errors (F12 → Console)
2. Check PHP error logs (xampp/php/logs/php_error_log)
3. Check network requests (F12 → Network tab)
4. Verify database structure matches schema files

---

## 🏆 Credits

Built with ❤️ for the Roomio community
