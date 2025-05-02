import { serve } from "std/server";
import { createTransport } from "nodemailer";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  const { to, subject, body } = await req.json();

  // Fetch SMTP settings from your Supabase DB
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const { data: smtp, error } = await supabase
    .from("smtp_settings")
    .select("*")
    .single();

  if (error || !smtp) {
    return new Response(JSON.stringify({ error: "SMTP settings not found" }), { status: 500 });
  }

  // If SMTP credentials are not set, return an error
  if (!smtp.host || !smtp.port || !smtp.username || !smtp.password || !smtp.from_email) {
    return new Response(JSON.stringify({ error: "SMTP credentials are incomplete" }), { status: 500 });
  }

  const transporter = createTransport({
    host: smtp.host,
    port: smtp.port,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  await transporter.sendMail({
    from: smtp.from_email,
    to,
    subject,
    text: body,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}); 