<?php
session_start();
session_unset();
session_destroy();
setcookie(session_name(), '', time()-3600, '/');

header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Session Cleared</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { color: #667eea; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; }
        a {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        a:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Session Cleared!</h1>
        <p>Your browser session has been completely cleared.</p>
        <a href="http://localhost:5173">Return to App</a>
    </div>
</body>
</html>
