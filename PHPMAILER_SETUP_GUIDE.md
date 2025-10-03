# PHPMailer Manual Installation Guide

## Step-by-Step Instructions

### Step 1: Download PHPMailer

If you already have PHPMailer on your machine, great! Otherwise download it from:
https://github.com/PHPMailer/PHPMailer/archive/refs/heads/master.zip

### Step 2: Extract and Place PHPMailer Files

1. Extract the PHPMailer ZIP file

2. Copy the PHPMailer folder structure to:
   ```
   c:\xampp\htdocs\roomio\php-api\vendor\phpmailer\phpmailer\
   ```

3. Your final folder structure should look like this:
   ```
   roomio/
   └── php-api/
       └── vendor/
           └── phpmailer/
               └── phpmailer/
                   ├── src/
                   │   ├── PHPMailer.php      ← Important!
                   │   ├── SMTP.php            ← Important!
                   │   ├── Exception.php       ← Important!
                   │   ├── POP3.php
                   │   └── OAuth.php
                   ├── language/
                   ├── get_oauth_token.php
                   ├── LICENSE
                   └── README.md
   ```

### Step 3: Verify Installation

Create a test file to verify PHPMailer is properly installed:

**Create:** `c:\xampp\htdocs\roomio\php-api\public\test-email.php`

```php
<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../lib/EmailSender.php';

header('Content-Type: application/json');

try {
    // Check if PHPMailer files exist
    $phpMailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';

    if (file_exists($phpMailerPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'PHPMailer is installed correctly!',
            'path' => $phpMailerPath
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'PHPMailer not found',
            'expected_path' => $phpMailerPath,
            'note' => 'Email will use PHP mail() fallback'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

Then visit: `http://localhost/roomio/php-api/public/test-email.php`

You should see:
```json
{
  "success": true,
  "message": "PHPMailer is installed correctly!",
  "path": "c:\\xampp\\htdocs\\roomio\\php-api\\vendor\\phpmailer\\phpmailer\\src\\PHPMailer.php"
}
```

---

## How the EmailSender Works

### Automatic Fallback System

The `EmailSender.php` class automatically detects if PHPMailer is available:

1. **PHPMailer Available** → Uses PHPMailer with SMTP
2. **PHPMailer Not Available** → Falls back to PHP mail()
3. **PHPMailer Fails** → Automatically tries PHP mail()

### Configuration

All email settings are stored in the database (`smtp_settings` table):
- SMTP Host
- SMTP Port
- SMTP Username
- SMTP Password
- From Email
- From Name
- Encryption (TLS/SSL)

### Usage in Your Code

```php
<?php
require_once __DIR__ . '/../lib/EmailSender.php';

$emailSender = new EmailSender($pdo);

// Simple email
$emailSender->send(
    'user@example.com',
    'Welcome to Roomio',
    '<h1>Welcome!</h1><p>Thanks for joining.</p>',
    true // isHTML
);

// Ticket notification
$emailSender->sendTicketNotification(
    123,                    // ticket ID
    'user@example.com',     // user email
    'Need help with login', // subject
    'I cannot log in...'    // message
);

// Ticket reply notification
$emailSender->sendTicketReplyNotification(
    123,                    // ticket ID
    'user@example.com',     // user email
    'Need help with login', // subject
    'Try resetting...',     // reply message
    true                    // is from admin
);
```

---

## Testing Email Functionality

### Test 1: Check PHPMailer Installation

Visit: `http://localhost/roomio/php-api/public/test-email.php`

### Test 2: Configure SMTP Settings

1. Go to: `http://localhost:5173/admin/smtp-settings`
2. Enter your SMTP details:
   - **Host:** smtp.gmail.com (for Gmail)
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** your-app-password
   - **From Email:** your-email@gmail.com
   - **From Name:** Roomio
   - **Encryption:** tls

3. Click "Save"

### Test 3: Send Test Email

Create: `c:\xampp\htdocs\roomio\php-api\public\send-test-email.php`

```php
<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../lib/EmailSender.php';

header('Content-Type: application/json');

try {
    $emailSender = new EmailSender($pdo);

    // Send test email
    $emailSender->send(
        'your-email@gmail.com', // Change this to your email
        'Roomio Test Email',
        '<h1>Test Successful!</h1><p>If you received this, email is working!</p>',
        true
    );

    echo json_encode([
        'success' => true,
        'message' => 'Test email sent! Check your inbox.'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

Visit: `http://localhost/roomio/php-api/public/send-test-email.php`

---

## Gmail SMTP Setup (Recommended for Testing)

### Option 1: Gmail with App Password (Recommended)

1. Enable 2-Step Verification in your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use these settings in SMTP Settings page:
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** (16-character app password)
   - **Encryption:** tls

### Option 2: Gmail with Less Secure Apps (Not Recommended)

1. Enable "Less secure app access" in Gmail settings
2. Use your regular Gmail password

---

## Troubleshooting

### Error: "PHPMailer not found"

**Solution:** Check that PHPMailer files are in the correct location:
```
c:\xampp\htdocs\roomio\php-api\vendor\phpmailer\phpmailer\src\PHPMailer.php
```

### Error: "SMTP connect() failed"

**Solutions:**
1. Check SMTP host and port are correct
2. Verify firewall allows outgoing connections on port 587/465
3. Try port 465 with SSL instead of 587 with TLS
4. Check if your ISP blocks SMTP connections

### Error: "Authentication failed"

**Solutions:**
1. Double-check username and password
2. For Gmail, use App Password (not regular password)
3. Enable "Less secure app access" for Gmail

### Fallback to PHP mail()

If PHPMailer fails, the system automatically tries PHP mail(). This requires:
- PHP mail() function enabled in php.ini
- Sendmail or SMTP server configured in php.ini

---

## Email Features in Roomio

### 1. Help Center Tickets

When a user submits a ticket:
- User receives confirmation email
- Admin receives notification email

When admin replies:
- User receives reply notification email

### 2. Ticket Threading

All ticket conversations are tracked:
- Stored in `ticket_responses` table
- Each reply triggers email notification
- Full conversation history visible in Help Center

### 3. Email Templates (Future)

You can create email templates in database:
```sql
CREATE TABLE email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_name VARCHAR(100) UNIQUE,
  subject VARCHAR(255),
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Summary

✅ **What's Set Up:**
- EmailSender class with automatic fallback
- PHPMailer support (if installed)
- PHP mail() fallback (always available)
- SMTP settings stored in database
- Ticket notification emails
- Ticket reply emails

✅ **What You Need to Do:**
1. Copy PHPMailer folder to `php-api/vendor/phpmailer/phpmailer/`
2. Configure SMTP settings in admin panel
3. Test email functionality
4. Done!

✅ **Fallback Protection:**
- If PHPMailer not installed → Uses PHP mail()
- If PHPMailer fails → Tries PHP mail()
- If both fail → Error logged, user sees error message

Your email system is production-ready with or without PHPMailer!
