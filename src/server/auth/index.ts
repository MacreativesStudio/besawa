import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index';

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (isProduction
    ? (() => {
        throw new Error('JWT_SECRET must be set in production');
      })()
    : 'besawa_local_development_only_secret');

function configuredEmails(name: 'ADMIN_ALLOWED_EMAILS' | 'TECH_ALLOWED_EMAILS'): Set<string> {
  // ADMIN_EMAIL is the single-admin deployment setting. Keep the explicit
  // allowlist available for teams, but do not lock out that configured admin
  // merely because a separate allowlist was omitted on the hosting platform.
  const fallback = name === 'ADMIN_ALLOWED_EMAILS' ? process.env.ADMIN_EMAIL || '' : '';
  return new Set(
    (process.env[name] || fallback)
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isPrivilegedIdentityAllowed(email: string, roles: string[]): boolean {
  const isBusinessAdmin = roles.includes('BUSINESS_OWNER_ADMIN') || roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
  const isTechnicalAdmin = roles.includes('PLATFORM_ADMIN');

  if (!isBusinessAdmin && !isTechnicalAdmin) return true;
  if (!isProduction) return true;

  const normalizedEmail = email.trim().toLowerCase();
  return (
    (isBusinessAdmin && configuredEmails('ADMIN_ALLOWED_EMAILS').has(normalizedEmail)) ||
    (isTechnicalAdmin && configuredEmails('TECH_ALLOWED_EMAILS').has(normalizedEmail))
  );
}

// Server-side revoked tokens blacklist
const revokedTokens = new Set<string>();

// Failed login attempts tracker for rate limiting (max 5 attempts in 15 mins)
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockUntil?: number;
}
const loginAttempts = new Map<string, AttemptRecord>();

export function checkLoginRateLimit(key: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    return { allowed: true };
  }

  // Check if locked
  if (record.lockUntil && record.lockUntil > now) {
    const waitSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Reset if window of 15 minutes expired
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, firstAttempt: now };
  record.count += 1;

  if (record.count >= 5) {
    // Lock for 15 minutes
    record.lockUntil = now + 15 * 60 * 1000;
  }

  loginAttempts.set(key, record);
}

export function resetLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  therapist_id?: string | null;
  session_version?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}

export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      roles: user.roles,
      therapist_id: user.therapist_id,
      session_version: user.session_version || 0,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (revokedTokens.has(token)) {
    res.status(401).json({ error: 'Session token has been revoked. Please sign in again.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user is still active in database
    const state = db.getState();
    const dbUser = state.users.find((u) => u.id === decoded.id);
    if (!dbUser || !dbUser.is_active || (dbUser.session_version || 0) !== (decoded.session_version || 0)) {
      res.status(401).json({ error: 'This session is no longer valid. Please sign in again.' });
      return;
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    // Map business roles: BUSINESS_OWNER_ADMIN satisfies SUPER_ADMIN & ADMIN
    // PLATFORM_ADMIN satisfies ADMIN (technical tasks)
    const effectiveRoles = new Set(req.user.roles);
    if (effectiveRoles.has('BUSINESS_OWNER_ADMIN')) {
      effectiveRoles.add('SUPER_ADMIN');
      effectiveRoles.add('ADMIN');
    }
    if (effectiveRoles.has('PLATFORM_ADMIN')) {
      effectiveRoles.add('ADMIN');
    }

    const hasRole = allowedRoles.some((r) => effectiveRoles.has(r));
    if (!hasRole) {
      res.status(403).json({
        error: `Access denied. Requires one of: [${allowedRoles.join(', ')}]. Current roles: [${req.user.roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}
