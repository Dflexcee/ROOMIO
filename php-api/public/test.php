<?php ?><!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Roomio PHP API Tester (PHP)</title>
	<style>
		body { font-family: system-ui, Arial, sans-serif; margin: 24px; }
		label { display:block; margin-top:12px; }
		input { width: 320px; max-width: 100%; padding:8px; margin-top:6px; }
		button { margin-top:14px; padding:10px 14px; }
		pre { background:#f5f5f5; padding:12px; white-space:pre-wrap; }
		.row { margin-top:18px; }
	</style>
</head>
<body>
	<h1>Roomio PHP API Tester (PHP)</h1>
	<p>Use this page to test Register, Login, Me and Logout using your normal browser.</p>

	<label>Email
		<input id="email" type="email" placeholder="admin@example.com" value="admin@example.com">
	</label>
	<label>Password
		<input id="password" type="password" placeholder="Admin!234" value="Admin!234">
	</label>

	<div class="row">
		<button id="btnRegister">Register</button>
		<button id="btnLogin">Login</button>
		<button id="btnMe">Me</button>
		<button id="btnLogout">Logout</button>
	</div>

	<h3>Result</h3>
	<pre id="out">(results appear here)</pre>

	<script>
	const out = document.getElementById('out');
	const email = document.getElementById('email');
	const password = document.getElementById('password');
	const base = location.href.replace(/\/(test\.php|test\.html).*/, '');

	function show(obj) { out.textContent = JSON.stringify(obj, null, 2); }

	document.getElementById('btnRegister').onclick = async () => {
		try {
			const res = await fetch(base + '/auth/register.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email: email.value, password: password.value })
			});
			show(await res.json());
		} catch (e) { show({ error: e.message }); }
	};

	document.getElementById('btnLogin').onclick = async () => {
		try {
			const res = await fetch(base + '/auth/login.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email: email.value, password: password.value })
			});
			show(await res.json());
		} catch (e) { show({ error: e.message }); }
	};

	document.getElementById('btnMe').onclick = async () => {
		try {
			const res = await fetch(base + '/auth/me.php', { credentials: 'include' });
			show(await res.json());
		} catch (e) { show({ error: e.message }); }
	};

	document.getElementById('btnLogout').onclick = async () => {
		try {
			const res = await fetch(base + '/auth/logout.php', { method: 'POST', credentials: 'include' });
			show(await res.json());
		} catch (e) { show({ error: e.message }); }
	};
	</script>
</body>
</html> 