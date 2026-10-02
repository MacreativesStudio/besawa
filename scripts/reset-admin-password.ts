import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD for this one-time local command. The password is never printed.');
}
if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  throw new Error('Use at least 12 characters including uppercase, lowercase, and a number.');
}

const dbFile = path.join(process.cwd(), 'data', 'be_sawa_db.json');
const state = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const user = state.users.find((candidate: any) => candidate.email?.toLowerCase() === email);

if (!user) {
  throw new Error('No user exists with that email. Check ADMIN_EMAIL before retrying.');
}

const roleIds = state.user_roles.filter((role: any) => role.user_id === user.id).map((role: any) => role.role_id);
const roleNames = state.roles.filter((role: any) => roleIds.includes(role.id)).map((role: any) => role.name);
const canAdminister = roleNames.some((role: string) => ['BUSINESS_OWNER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN'].includes(role));
if (!canAdminister) {
  throw new Error('The selected account is not an administrator. This command only resets administrator accounts.');
}

user.password_hash = await bcrypt.hash(password, 12);
user.session_version = (user.session_version || 0) + 1;
user.updated_at = new Date().toISOString();
state.audit_logs.unshift({
  id: `aud_${Date.now()}_password_reset`,
  user_id: user.id,
  user_email: email,
  action: 'ADMIN_PASSWORD_RESET_LOCAL',
  entity_type: 'USER',
  entity_id: user.id,
  details: { source: 'local maintenance command' },
  ip_address: 'local-maintenance',
  created_at: new Date().toISOString(),
});
fs.writeFileSync(dbFile, JSON.stringify(state, null, 2), 'utf8');
console.log(`Password reset for ${email}. Restart the Be Sawa server, then sign in at /admin.`);
