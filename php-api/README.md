# PHP API for Roomio (Beginner-Friendly)

This folder contains a tiny PHP + MySQL API to replace Supabase auth.

## What this gives you now
- Register user: POST /auth/register
- Login user: POST /auth/login
- Current user: GET /auth/me
- Logout: POST /auth/logout

## 1) Install XAMPP (Windows beginner way)
- Download XAMPP (Apache + MySQL + PHP) and install it.
- Open XAMPP Control Panel → Start Apache and MySQL.

## 2) Create a database
- Click MySQL "Admin" (phpMyAdmin).
- Create a database named: roomio
- Click the roomio database → Import → choose `schema.sql` from this folder → Import.

## 3) Put this API where Apache can see it
- Find your XAMPP htdocs folder (usually C:\\xampp\\htdocs).
- Copy the `php-api` folder into htdocs.
- You will end up with: C:\\xampp\\htdocs\\php-api\\public

## 4) Configure the database connection
- Open `php-api/config.php`.
- Set your MySQL username/password. For XAMPP default:
  - host: 127.0.0.1
  - database: roomio
  - user: root
  - password: (empty)

## 5) Test the API
- In your browser, go to: http://localhost/php-api/public/
  - You should see a JSON hello message.
- Register: POST http://localhost/php-api/public/auth/register.php
  - JSON body: { "email": "test@example.com", "password": "Test!234" }
- Login: POST http://localhost/php-api/public/auth/login.php
  - JSON body: { "email": "test@example.com", "password": "Test!234" }
- Me: GET http://localhost/php-api/public/auth/me.php
- Logout: POST http://localhost/php-api/public/auth/logout.php

Tip: You can test with a browser extension like "RESTer" or Postman.

## 6) Using this with your React app (later)
- We will point the frontend to these endpoints.
- For local use, the base URL will be: http://localhost/php-api/public
- For hosting, it will be: https://yourdomain.com/api (we can place files under public_html/api)

## 7) Shared hosting (cPanel) quick steps
- Upload the `php-api/public` folder into `public_html/api` on cPanel.
- Upload `config.php`, `bootstrap.php`, `lib` and `schema.sql` somewhere above or also under `api` (keep structure the same under `api`).
- In cPanel → MySQL Databases: create database `roomio`, create user, grant ALL privileges to that database.
- In cPanel → phpMyAdmin: select the `roomio` database → Import `schema.sql`.
- Edit `config.php` with your cPanel DB name, user, and password.
- Visit `https://yourdomain.com/api/` to see the hello message.

## 8) Make an admin user
- Register a normal user first (`/auth/register`).
- In phpMyAdmin → table `users` → find your user → set `role` to `admin`.
- Now this user is an admin.

That’s it for the first step. Once confirmed working, we will wire your React app to call this API. 