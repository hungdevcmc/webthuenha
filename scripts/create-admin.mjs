#!/usr/bin/env node
/**
 * Tạo (hoặc cấp quyền cho) tài khoản admin đầu tiên.
 *
 * Cách dùng (chạy trên máy bạn, KHÔNG chạy trên Vercel):
 *   node scripts/create-admin.mjs <email> [mật khẩu]
 *
 * Cần các biến trong .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * - Nếu email chưa tồn tại: tạo user (đã xác nhận email) với mật khẩu cho trước
 *   hoặc mật khẩu ngẫu nhiên (in ra màn hình một lần duy nhất).
 * - Nếu email đã tồn tại: chỉ cấp quyền admin (không đổi mật khẩu).
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const [email, passwordArg] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error("Cách dùng: node scripts/create-admin.mjs <email> [mật khẩu]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserByEmail(target) {
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

let user = await findUserByEmail(email);
let generatedPassword = null;

if (!user) {
  const password = passwordArg ?? randomBytes(12).toString("base64url");
  generatedPassword = passwordArg ? null : password;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Không tạo được user:", error.message);
    process.exit(1);
  }
  user = data.user;
  console.log(`✔ Đã tạo tài khoản ${email}`);
} else {
  console.log(`ℹ Tài khoản ${email} đã tồn tại, chỉ cấp quyền admin.`);
}

const { error: adminError } = await supabase.from("admin_users").upsert({ user_id: user.id }, { onConflict: "user_id" });
if (adminError) {
  console.error("Không cấp được quyền admin:", adminError.message);
  process.exit(1);
}
console.log(`✔ ${email} đã là admin.`);
if (generatedPassword) {
  console.log("\nMật khẩu tạm (chỉ hiện một lần, hãy đổi sau khi đăng nhập):");
  console.log(`   ${generatedPassword}\n`);
}
