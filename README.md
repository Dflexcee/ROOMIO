# ROOMIO
THIS IS ROOMMATE APP THAT PEOPLE FIND ROOMMATE AND ALOS HAS FEATURES OF REAL ESTATE LISTING AAND OTHER  FEATURES,. BUILD WITH REACT, -VITE-SUPERBASE. LATER WILL BE CONVERTED TO REACT NATIVE FOR MOBILE APPS
Here’s a complete professional summary and feature list of the **CampusMate** app — covering both the **user-facing features** and the **admin dashboard functionalities**:

---

# 🏠 CampusMate – App Overview & Feature Summary

**CampusMate** is a multi-platform web/mobile app designed to help students, agents, and landlords find safe and verified accommodations and roommates across Nigerian campuses. The platform also offers scam alerts, user verification, and monetized features for trusted operations.

---

## 👨‍🎓 USER-SIDE FEATURES

### 🔐 Onboarding & Authentication

* Onboarding intro carousel (3-step)
* Signup / Login with email
* Profile Setup (full name, age, school, lifestyle, budget)

### 🏠 Housing & Roommate Features

* **Find Roommate** (filters: gender, school, lifestyle, religion)
* **Find Room** (filter by location, rent, gender preference)
* **Post a Room** (by tenant, agent, or landlord — verification required)
* **View My Posted Rooms** (edit/delete own listings)

### 💬 Interaction

* **Chat System** (Inbox to contact roommates or posters)
* **Community Feed** (post questions, reply to others)
* **Scam Board** (submit & view scam alerts and housing tips)
* **Help Center** (submit inquiries to admin / support tickets)
* **Support Ticket Replies** (view conversations with admin)

### 🔒 Monetization (User Side)

* Paywall before:

  * Viewing full roommate profile
  * Contacting a poster
  * Posting as an agent/landlord (if locked)
* Dynamic pricing/duration (1 week, 1 month, etc.)
* Dummy or live payment system (Paystack/Flutterwave ready)

### ⚙️ Settings & Profile

* Profile Edit Page
* Upload/change profile photo
* Verification Form (upload ID as agent/landlord/tenant)
* View verification status
* Terms of Use & Privacy Page (optional)
* Dark Mode support (optional)

---

## 🛠️ ADMIN DASHBOARD FEATURES

### 🧑‍💼 User Management

* View/Search all users
* Suspend or Ban users
* Export users (CSV)
* Filter by role, verification status

### 🏘️ Listing Control

* View all posted rooms
* Approve, Reject, or Flag rooms
* View room details and poster info

### 🧍 Agent / Landlord Verification

* Review submitted ID uploads
* Approve, Reject, or Request more info
* Filter by role and status

### 🧾 Support Tickets

* View all user-submitted tickets
* Reply via chat interface
* Track ticket status: open, resolved

### 📣 Broadcast Center

* Send Email or SMS to:

  * All users, verified only, by role, gender, school
* Compose and store announcements

### 💸 Monetization Manager

* Set premium feature price (e.g. contact lister = ₦1000/week)
* Lock/unlock features (POST\_AS\_AGENT, CONTACT\_LISTER, etc.)
* Set duration (days, weeks, months)
* View and manage who paid
* Manually grant/revoke access to any user

### 📊 Analytics Dashboard

* Total users, verified accounts, listings
* Activity per region, school
* Top chat days, top posters

### 🚨 Logs & Blacklist

* View banned users
* View all logs (bans, approvals, reports)
* Add/remove blacklisted accounts manually

### 📂 Email & SMS Configuration

* Manage SMTP credentials (email sender)
* Add/edit reusable email templates
* SMS API setup (Twilio, Termii, etc.)

### 📢 Ads Management

* Upload and display monetized banner ads
* Toggle ad status (active/inactive)

---

## 📦 Technical Stack (If Needed)

* Frontend: React (Vite), TailwindCSS
* Backend/Auth: Supabase
* Storage: Supabase Buckets
* Admin dashboard is fully protected (admin/manager roles)

---

BY COLLINS EZIH (FLEXCEETECH)
