import { Router, Request, Response } from 'express';
import { db } from '../db/index';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authMiddleware,
  requireRoles,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  revokeToken,
  isPrivilegedIdentityAllowed,
} from '../auth/index';
import { calculateTherapistSlots } from '../services/availability';
import { initiateMpesaPayment, verifyAndConfirmPayment } from '../services/payments';

export const apiRouter = Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalizedPhone(value: string): string {
  return value.replace(/\D/g, '').replace(/^254/, '0');
}

function isValidFutureDate(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00+03:00`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
  return value >= today;
}

function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')
    ? Number.isFinite(Number(value)) && Number(value) >= 0
    : false;
}

function cleanStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean))];
}

function isTherapistReadyForPublication(therapist: any): boolean {
  return Boolean(
    therapist.full_name?.trim() &&
      therapist.title?.trim() &&
      therapist.bio?.trim() &&
      therapist.profile_photo_url?.trim() &&
      therapist.languages?.length &&
      therapist.areas_of_practice?.length
  );
}

function buildCareTeamWhatsAppUrl(settings: Record<string, any>, message: string): string {
  const rawNumber = String(settings.whatsapp_number || '0710759422').replace(/[^0-9]/g, '');
  const number = rawNumber.startsWith('0') ? `254${rawNumber.slice(1)}` : rawNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// ====================================================================
// 1. AUTHENTICATION & SESSIONS
// ====================================================================

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const inputEmail = email.toLowerCase().trim();
    const rateLimitKey = `${req.ip || 'ip'}_${inputEmail}`;
    const rateCheck = checkLoginRateLimit(rateLimitKey);

    if (!rateCheck.allowed) {
      res.status(429).json({
        error: `Account temporarily locked due to multiple failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
      });
      return;
    }

    const state = db.getState();
    const user = state.users.find(
      (u) =>
        u.email.toLowerCase() === inputEmail ||
        (inputEmail === 'admin@besawa.co.ke' && u.email.toLowerCase() === 'admin@besawa.ke') ||
        (inputEmail === 'admin@besawa.ke' && u.email.toLowerCase() === 'admin@besawa.co.ke')
    );

    if (!user || !user.is_active) {
      recordFailedLogin(rateLimitKey);
      db.logAudit('USER_LOGIN_FAILED', 'USER', 'unknown', { email: inputEmail, reason: 'User not found or inactive' });
      res.status(401).json({ error: 'Invalid credentials or inactive account.' });
      return;
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      recordFailedLogin(rateLimitKey);
      db.logAudit('USER_LOGIN_FAILED', 'USER', user.id, { email: user.email, reason: 'Invalid password' });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Reset failed login counter upon successful authentication
    resetLoginAttempts(rateLimitKey);

    // Get user roles
    const userRoleLinks = state.user_roles.filter((ur) => ur.user_id === user.id);
    const roleIds = userRoleLinks.map((ur) => ur.role_id);
    const roles = state.roles.filter((r) => roleIds.includes(r.id)).map((r) => r.name);

    // Check if therapist
    const therapist = state.therapists.find((t) => t.user_id === user.id);

    const authUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      roles,
      therapist_id: therapist ? therapist.id : null,
      session_version: user.session_version || 0,
    };

    if (!isPrivilegedIdentityAllowed(user.email, roles)) {
      recordFailedLogin(rateLimitKey);
      db.logAudit('PRIVILEGED_LOGIN_DENIED', 'USER', user.id, { email: user.email }, user.id, user.email);
      res.status(403).json({ error: 'This account is not authorized for administrative access.' });
      return;
    }

    const token = generateToken(authUser);

    // Update last login
    db.mutate((draft) => {
      const u = draft.users.find((x) => x.id === user.id);
      if (u) u.last_login_at = new Date().toISOString();
    });

    db.logAudit('USER_LOGIN', 'USER', user.id, { email: user.email, roles }, user.id, user.email);

    res.json({
      token,
      user: authUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal authentication failure.' });
  }
});

apiRouter.post('/auth/logout', authMiddleware, (req: Request, res: Response) => {
  if (req.token) {
    revokeToken(req.token);
  }
  db.logAudit('USER_LOGOUT', 'USER', req.user?.id || 'unknown', {}, req.user?.id, req.user?.email);
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.post('/auth/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current password and new password are required.' });
      return;
    }

    if (newPassword.length < 12 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      res.status(400).json({ error: 'Use at least 12 characters with uppercase, lowercase, and a number.' });
      return;
    }

    const state = db.getState();
    const user = state.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const isCurrentValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      res.status(401).json({ error: 'Current password provided is incorrect.' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    db.mutate((draft) => {
      const u = draft.users.find((x) => x.id === user.id);
      if (u) {
        u.password_hash = newHash;
        u.updated_at = now;
        u.session_version = (u.session_version || 0) + 1;
      }
    });

    db.logAudit('USER_PASSWORD_CHANGED', 'USER', user.id, { email: user.email }, user.id, user.email);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

apiRouter.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/bootstrap-first-admin', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'This setup endpoint is not available.' });
    return;
  }
  try {
    const state = db.getState();
    const existingAdmins = state.users.filter((u) => {
      const uRoles = state.user_roles.filter((ur) => ur.user_id === u.id).map((ur) => ur.role_id);
      return uRoles.includes('role_super_admin') || uRoles.includes('role_admin');
    });

    if (existingAdmins.length > 0) {
      res.status(403).json({ error: 'Admin bootstrap is locked. Administrators already exist.' });
      return;
    }

    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full name are required.' });
      return;
    }

    const hash = await hashPassword(password);
    const newUserId = `usr_${Date.now()}`;
    const now = new Date().toISOString();

    db.mutate((draft) => {
      draft.users.push({
        id: newUserId,
        email: email.toLowerCase(),
        password_hash: hash,
        full_name,
        phone: phone || '',
        is_active: true,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      });

      draft.user_roles.push({
        user_id: newUserId,
        role_id: 'role_super_admin',
        assigned_at: now,
      });
    });

    db.logAudit('SUPER_ADMIN_BOOTSTRAP', 'USER', newUserId, { email, full_name });

    res.json({ success: true, message: 'Super Admin bootstrapped successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// 2. SERVICES & CATEGORIES
// ====================================================================

apiRouter.get('/services', (req: Request, res: Response) => {
  const state = db.getState();
  const activeServices = state.services
    .filter((s) => s.is_active)
    .map((s) => {
      const category = state.service_categories.find((c) => c.id === s.category_id);
      return {
        ...s,
        category_name: category ? category.name : 'General',
      };
    });

  res.json({
    categories: state.service_categories,
    services: activeServices,
  });
});

apiRouter.post('/services', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { name, slug, description, category_id, duration_minutes, price, currency, delivery_mode } = req.body;
  if (!name?.trim() || !description?.trim() || !isPositiveNumber(price) || !isPositiveNumber(duration_minutes || 50)) {
    res.status(400).json({ error: 'Name, description, and price are required.' });
    return;
  }

  const id = `srv_${Date.now()}`;
  const now = new Date().toISOString();
  const serviceSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  db.mutate((draft) => {
    draft.services.push({
      id,
      category_id: category_id || null,
      name,
      slug: serviceSlug,
      description,
      duration_minutes: Number(duration_minutes) || 50,
      price: Number(price),
      currency: currency || 'KES',
      delivery_mode: delivery_mode || 'BOTH',
      is_active: true,
      booking_instructions: req.body.booking_instructions || '',
      min_age: req.body.min_age || 18,
      max_age: req.body.max_age || null,
      created_at: now,
      updated_at: now,
    });
  });

  db.logAudit('SERVICE_CREATED', 'SERVICE', id, { name, price }, req.user?.id, req.user?.email);
  res.status(201).json({ success: true, serviceId: id });
});

apiRouter.patch('/services/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const allowedFields = ['name', 'slug', 'description', 'category_id', 'duration_minutes', 'price', 'currency', 'delivery_mode', 'is_active', 'booking_instructions', 'min_age', 'max_age'];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key)));
  if (Object.keys(updates).length === 0 ||
      ('price' in updates && !isPositiveNumber(updates.price)) ||
      ('duration_minutes' in updates && (!isPositiveNumber(updates.duration_minutes) || Number(updates.duration_minutes) < 1))) {
    res.status(400).json({ error: 'Provide valid editable service fields, including a non-negative price and positive duration.' });
    return;
  }
  const now = new Date().toISOString();

  let found = false;
  db.mutate((draft) => {
    const s = draft.services.find((x) => x.id === id);
    if (s) {
      found = true;
      Object.assign(s, updates, { updated_at: now });
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }

  db.logAudit('SERVICE_UPDATED', 'SERVICE', id, updates, req.user?.id, req.user?.email);
  res.json({ success: true });
});

apiRouter.delete('/services/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;
  let serviceName = '';

  db.mutate((draft) => {
    const idx = draft.services.findIndex((s) => s.id === id);
    if (idx !== -1) {
      serviceName = draft.services[idx].name;
      draft.services.splice(idx, 1);
      // Remove any therapist_services links
      draft.therapist_services = draft.therapist_services.filter((ts) => ts.service_id !== id);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }

  db.logAudit('SERVICE_DELETED', 'SERVICE', id, { serviceName }, req.user?.id, req.user?.email);
  res.json({ success: true, message: `Service "${serviceName}" removed successfully.` });
});

// Admin All Services (Active and Inactive)
apiRouter.get('/admin/services', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  const allServices = state.services.map((s) => {
    const category = state.service_categories.find((c) => c.id === s.category_id);
    const assignedTherapistCount = state.therapist_services.filter((ts) => ts.service_id === s.id).length;
    return {
      ...s,
      category_name: category ? category.name : 'General',
      assigned_therapist_count: assignedTherapistCount,
    };
  });

  res.json({
    categories: state.service_categories,
    services: allServices,
  });
});

// ====================================================================
// 3. PACKAGES
// ====================================================================

apiRouter.get('/packages', (req: Request, res: Response) => {
  const state = db.getState();
  const activePackages = state.packages.filter((p) => p.is_active);
  res.json({ packages: activePackages });
});

// Admin All Packages
apiRouter.get('/admin/packages', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ packages: state.packages });
});

apiRouter.post('/admin/packages', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { name, slug, description, number_of_sessions, price, currency, validity_days } = req.body;
  if (!name?.trim() || !isPositiveNumber(price) || !Number.isInteger(Number(number_of_sessions)) || Number(number_of_sessions) < 1 || !Number.isInteger(Number(validity_days || 60)) || Number(validity_days || 60) < 1) {
    res.status(400).json({ error: 'Name, price, and number of sessions are required.' });
    return;
  }

  const id = `pkg_${Date.now()}`;
  const now = new Date().toISOString();
  const packageSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  db.mutate((draft) => {
    draft.packages.push({
      id,
      name,
      slug: packageSlug,
      description: description || '',
      number_of_sessions: Number(number_of_sessions),
      price: Number(price),
      currency: currency || 'KES',
      validity_days: Number(validity_days) || 60,
      is_active: true,
      created_at: now,
    });
  });

  db.logAudit('PACKAGE_CREATED', 'PACKAGE', id, { name, price, number_of_sessions }, req.user?.id, req.user?.email);
  res.status(201).json({ success: true, packageId: id });
});

apiRouter.patch('/admin/packages/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const allowedFields = ['name', 'slug', 'description', 'number_of_sessions', 'price', 'currency', 'validity_days', 'is_active'];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key)));
  if (Object.keys(updates).length === 0 ||
      ('price' in updates && !isPositiveNumber(updates.price)) ||
      ('number_of_sessions' in updates && (!Number.isInteger(Number(updates.number_of_sessions)) || Number(updates.number_of_sessions) < 1)) ||
      ('validity_days' in updates && (!Number.isInteger(Number(updates.validity_days)) || Number(updates.validity_days) < 1))) {
    res.status(400).json({ error: 'Provide valid editable package fields.' });
    return;
  }

  let found = false;
  db.mutate((draft) => {
    const p = draft.packages.find((x) => x.id === id);
    if (p) {
      found = true;
      Object.assign(p, updates);
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Package not found.' });
    return;
  }

  db.logAudit('PACKAGE_UPDATED', 'PACKAGE', id, updates, req.user?.id, req.user?.email);
  res.json({ success: true });
});

apiRouter.delete('/admin/packages/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;
  let packageName = '';

  db.mutate((draft) => {
    const idx = draft.packages.findIndex((p) => p.id === id);
    if (idx !== -1) {
      packageName = draft.packages[idx].name;
      draft.packages.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Package not found.' });
    return;
  }

  db.logAudit('PACKAGE_DELETED', 'PACKAGE', id, { packageName }, req.user?.id, req.user?.email);
  res.json({ success: true, message: `Package "${packageName}" removed successfully.` });
});

// ====================================================================
// 4. THERAPISTS (PUBLIC & ADMIN)
// ====================================================================

// Public Directory: ONLY active and approved/active/verified practitioners with stripped private credentials
apiRouter.get('/therapists/public', (req: Request, res: Response) => {
  const state = db.getState();
  const publicTherapists = state.therapists
    .filter((t) => t.is_active && (t.verification_status === 'APPROVED' || t.verification_status === 'ACTIVE' || t.verification_status === 'VERIFIED'))
    .map((t) => {
      // Find services supported by this therapist
      const serviceLinks = state.therapist_services.filter((ts) => ts.therapist_id === t.id);
      const sIds = serviceLinks.map((ts) => ts.service_id);
      const supportedServices = state.services.filter((s) => sIds.includes(s.id));

      // Credential summary: safe verification note only
      const verifiedCredentials = state.therapist_credentials
        .filter((c) => c.therapist_id === t.id && c.status === 'VERIFIED')
        .map((c) => ({
          document_type: c.document_type,
          issuing_authority: c.issuing_authority,
        }));

      return {
        id: t.id,
        full_name: t.full_name,
        title: t.title,
        bio: t.bio,
        years_experience: t.years_experience,
        languages: t.languages,
        areas_of_practice: t.areas_of_practice,
        profile_photo_url: t.profile_photo_url,
        verification_status: t.verification_status,
        supports_online: t.supports_online,
        supports_in_person: t.supports_in_person,
        supported_services: supportedServices.map((s) => ({ id: s.id, name: s.name, price: s.price })),
        credential_summary: verifiedCredentials,
      };
    });

  res.json({ therapists: publicTherapists });
});

// Admin Directory: Full practitioner management including private files and internal notes
apiRouter.get('/admin/therapists', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  const fullTherapists = state.therapists.map((t) => {
    const credentials = state.therapist_credentials.filter((c) => c.therapist_id === t.id);
    const serviceLinks = state.therapist_services.filter((ts) => ts.therapist_id === t.id);
    return {
      ...t,
      credentials,
      service_ids: serviceLinks.map((ts) => ts.service_id),
    };
  });

  res.json({ therapists: fullTherapists });
});

apiRouter.post('/admin/therapists', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const {
    full_name,
    title,
    bio,
    years_experience,
    languages,
    areas_of_practice,
    profile_photo_url,
    supports_online,
    supports_in_person,
    service_ids,
    internal_admin_notes,
  } = req.body;

  if (!full_name?.trim()) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }

  const id = `thp_${Date.now()}`;
  const now = new Date().toISOString();

  db.mutate((draft) => {
    draft.therapists.push({
      id,
      user_id: null,
      full_name,
      title: typeof title === 'string' ? title.trim() : '',
      bio: typeof bio === 'string' ? bio.trim() : '',
      years_experience: Number(years_experience) || 0,
      languages: cleanStringList(languages),
      areas_of_practice: cleanStringList(areas_of_practice),
      profile_photo_url: profile_photo_url || '',
      verification_status: 'PENDING',
      is_active: false,
      supports_online: supports_online ?? true,
      supports_in_person: supports_in_person ?? true,
      session_rate_override: null,
      internal_admin_notes: internal_admin_notes || 'Onboarded via Admin Console.',
      created_at: now,
      updated_at: now,
    });

    // Link services
    if (Array.isArray(service_ids)) {
      for (const sId of service_ids) {
        draft.therapist_services.push({ therapist_id: id, service_id: sId });
      }
    }

    // Default availability rules (Mon-Fri 09:00 - 17:00)
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
      draft.availability_rules.push({
        id: `avr_${id}_${day.toLowerCase()}`,
        therapist_id: id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 50,
        break_duration_minutes: 10,
        is_active: true,
      });
    }
  });

  db.logAudit('THERAPIST_CREATED', 'THERAPIST', id, { full_name, title }, req.user?.id, req.user?.email);
  res.status(201).json({ success: true, therapistId: id });
});

apiRouter.patch('/admin/therapists/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const allowedFields = ['full_name', 'title', 'bio', 'years_experience', 'profile_photo_url', 'supports_online', 'supports_in_person', 'session_rate_override', 'internal_admin_notes', 'is_active'];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key)));
  const hasLanguages = Object.prototype.hasOwnProperty.call(req.body || {}, 'languages');
  const hasAreas = Object.prototype.hasOwnProperty.call(req.body || {}, 'areas_of_practice');
  const hasServices = Object.prototype.hasOwnProperty.call(req.body || {}, 'service_ids');

  if (Object.keys(updates).length === 0 && !hasLanguages && !hasAreas && !hasServices) {
    res.status(400).json({ error: 'Provide at least one editable therapist field.' });
    return;
  }
  if ('full_name' in updates && (!String(updates.full_name).trim() || String(updates.full_name).trim().length > 120)) {
    res.status(400).json({ error: 'A valid practitioner name is required.' });
    return;
  }
  if ('years_experience' in updates && (!Number.isInteger(Number(updates.years_experience)) || Number(updates.years_experience) < 0 || Number(updates.years_experience) > 80)) {
    res.status(400).json({ error: 'Experience must be a whole number from 0 to 80.' });
    return;
  }
  if ('session_rate_override' in updates && updates.session_rate_override !== null && !isPositiveNumber(updates.session_rate_override)) {
    res.status(400).json({ error: 'Session-rate override must be a non-negative number.' });
    return;
  }
  const serviceIds = hasServices ? cleanStringList(req.body.service_ids) : [];
  const now = new Date().toISOString();
  let found = false;

  db.mutate((draft) => {
    const therapist = draft.therapists.find((item) => item.id === id);
    if (!therapist) return;
    found = true;
    Object.assign(therapist, updates, { updated_at: now });
    if (hasLanguages) therapist.languages = cleanStringList(req.body.languages);
    if (hasAreas) therapist.areas_of_practice = cleanStringList(req.body.areas_of_practice);
    if (hasServices) {
      draft.therapist_services = draft.therapist_services.filter((link) => link.therapist_id !== id);
      for (const serviceId of serviceIds) {
        if (draft.services.some((service) => service.id === serviceId)) draft.therapist_services.push({ therapist_id: id, service_id: serviceId });
      }
    }
  });
  if (!found) {
    res.status(404).json({ error: 'Therapist not found.' });
    return;
  }
  db.logAudit('THERAPIST_UPDATED', 'THERAPIST', id, { fields: [...Object.keys(updates), ...(hasLanguages ? ['languages'] : []), ...(hasAreas ? ['areas_of_practice'] : []), ...(hasServices ? ['service_ids'] : [])] }, req.user?.id, req.user?.email);
  res.json({ success: true });
});

apiRouter.patch('/admin/therapists/:id/verification', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { verification_status, notes } = req.body;

  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'SUSPENDED'];
  if (!validStatuses.includes(verification_status)) {
    res.status(400).json({ error: `Invalid verification status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const now = new Date().toISOString();
  let found = false;

  db.mutate((draft) => {
    const t = draft.therapists.find((x) => x.id === id);
    if (t) {
      if (['APPROVED', 'VERIFIED'].includes(verification_status) && !isTherapistReadyForPublication(t)) {
        return;
      }
      found = true;
      t.verification_status = verification_status;
      if (notes) {
        t.internal_admin_notes = `${t.internal_admin_notes || ''}\n[${now}] Status changed to ${verification_status}: ${notes}`;
      }
      t.updated_at = now;
    }
  });

  if (!found) {
    const exists = db.getState().therapists.some((therapist) => therapist.id === id);
    res.status(exists ? 400 : 404).json({ error: exists ? 'Complete name, title, biography, photo, languages, and specialties before publishing a therapist.' : 'Therapist not found.' });
    return;
  }

  db.logAudit(
    'THERAPIST_VERIFICATION_UPDATED',
    'THERAPIST',
    id,
    { verification_status, notes },
    req.user?.id,
    req.user?.email
  );

  res.json({ success: true, verification_status });
});

apiRouter.delete('/admin/therapists/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;
  let therapistName = '';

  db.mutate((draft) => {
    const idx = draft.therapists.findIndex((t) => t.id === id);
    if (idx !== -1) {
      therapistName = draft.therapists[idx].full_name;
      draft.therapists.splice(idx, 1);
      // Clean up relations
      draft.therapist_services = draft.therapist_services.filter((ts) => ts.therapist_id !== id);
      draft.availability_rules = draft.availability_rules.filter((ar) => ar.therapist_id !== id);
      draft.therapist_credentials = draft.therapist_credentials.filter((tc) => tc.therapist_id !== id);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Therapist not found.' });
    return;
  }

  db.logAudit('THERAPIST_DELETED', 'THERAPIST', id, { therapistName }, req.user?.id, req.user?.email);
  res.json({ success: true, message: `Practitioner "${therapistName}" removed successfully.` });
});

// ====================================================================
// 5. AVAILABILITY ENGINE
// ====================================================================

apiRouter.get('/availability/slots', (req: Request, res: Response) => {
  const { therapistId, serviceId, date } = req.query as {
    therapistId: string;
    serviceId: string;
    date: string;
  };

  if (!therapistId || !serviceId || !date) {
    res.status(400).json({ error: 'therapistId, serviceId, and date (YYYY-MM-DD) are required.' });
    return;
  }

  const slots = calculateTherapistSlots(therapistId, serviceId, date);
  res.json({ date, therapistId, serviceId, slots });
});

// ====================================================================
// 6. BOOKINGS
// ====================================================================

apiRouter.post('/bookings', (req: Request, res: Response) => {
  try {
    const {
      service_id,
      therapist_id,
      date,
      time,
      delivery_mode,
      client_name,
      client_phone,
      client_email,
      client_notes,
    } = req.body;

    if (!service_id || !therapist_id || !date || !time || !client_name || !client_phone) {
      res.status(400).json({ error: 'All required booking fields must be provided.' });
      return;
    }

    if (
      typeof client_name !== 'string' ||
      client_name.trim().length < 2 ||
      (client_email && !emailPattern.test(client_email)) ||
      normalizedPhone(client_phone).length < 9 ||
      !isValidFutureDate(date) ||
      !timePattern.test(time) ||
      !['ONLINE', 'IN_PERSON'].includes(delivery_mode || 'ONLINE')
    ) {
      res.status(400).json({ error: 'Please provide valid contact details, appointment date, time, and session format.' });
      return;
    }

    const state = db.getState();

    // Verify service
    const service = state.services.find((s) => s.id === service_id && s.is_active);
    if (!service) {
      res.status(404).json({ error: 'Selected service is invalid or unavailable.' });
      return;
    }

    // Verify therapist
    const therapist = state.therapists.find(
      (t) => t.id === therapist_id && t.is_active && (t.verification_status === 'APPROVED' || t.verification_status === 'ACTIVE' || t.verification_status === 'VERIFIED')
    );
    if (!therapist) {
      res.status(404).json({ error: 'Selected therapist is not available for booking.' });
      return;
    }

    const providesService = state.therapist_services.some(
      (link) => link.therapist_id === therapist_id && link.service_id === service_id
    );
    if (!providesService) {
      res.status(400).json({ error: 'This practitioner does not offer the selected service.' });
      return;
    }

    // Real-time slot availability check
    const availableSlots = calculateTherapistSlots(therapist_id, service_id, date);
    const targetSlot = availableSlots.find((s) => s.time === time);

    if (!targetSlot || !targetSlot.available) {
      res.status(409).json({
        error: 'The selected time slot is no longer available. Please select another slot.',
      });
      return;
    }

    // Generate unique booking reference (e.g. BS-48291)
    let bookingRef = '';
    do {
      bookingRef = `BS-${Math.floor(10000000 + Math.random() * 90000000)}`;
    } while (state.bookings.some((booking) => booking.booking_reference === bookingRef));
    const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const price = therapist.session_rate_override || service.price;

    const newBooking = {
      id,
      booking_reference: bookingRef,
      service_id,
      therapist_id,
      date,
      time,
      duration_minutes: service.duration_minutes,
      amount: price,
      currency: service.currency || 'KES',
      delivery_mode: delivery_mode || 'ONLINE',
      client_name,
      client_phone,
      client_email: typeof client_email === 'string' ? client_email.trim() : '',
      client_notes: client_notes || '',
      // V1 is care-team / WhatsApp led. Availability and payment are confirmed
      // by the team; do not promise a paid or scheduled appointment yet.
      status: 'PENDING_CONFIRMATION',
      cancellation_reason: null,
      cancelled_at: null,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    db.mutate((draft) => {
      draft.bookings.push(newBooking);
    });

    db.logAudit('BOOKING_CREATED', 'BOOKING', id, {
      reference: bookingRef,
      therapist: therapist.full_name,
      service: service.name,
      amount: price,
    });

    const whatsappMessage =
      `Hello Be Sawa Care Team, I have submitted a booking request.\n\n` +
      `*Booking reference:* ${bookingRef}\n` +
      `*Service:* ${service.name}\n` +
      `*Practitioner:* ${therapist.full_name}\n` +
      `*Requested time:* ${date} at ${time} (EAT)\n` +
      `*Format:* ${delivery_mode === 'ONLINE' ? 'Online session' : 'In-person session'}\n` +
      `*Amount:* ${newBooking.currency} ${newBooking.amount.toLocaleString()}\n\n` +
      `Please confirm availability and guide me on payment. I understand payment is verified in this WhatsApp chat.`;

    res.status(201).json({
      success: true,
      booking: newBooking,
      whatsappUrl: buildCareTeamWhatsAppUrl(state.business_settings, whatsappMessage),
    });
  } catch (err: any) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// Secure Client Reference Lookup
apiRouter.get('/bookings/lookup', (req: Request, res: Response) => {
  const { reference, contact } = req.query as { reference: string; contact: string };

  if (!reference || !contact) {
    res.status(400).json({ error: 'Both booking reference and phone/email are required.' });
    return;
  }

  const cleanRef = reference.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();

  const state = db.getState();
    const booking = state.bookings.find((b) => {
      if (b.booking_reference.toUpperCase() !== cleanRef) return false;
    const phoneMatch = normalizedPhone(b.client_phone) === normalizedPhone(cleanContact);
    const emailMatch = b.client_email.toLowerCase() === cleanContact;
    return phoneMatch || emailMatch;
  });

  if (!booking) {
    res.status(404).json({ error: 'No matching booking found for this reference and contact detail.' });
    return;
  }

  const service = state.services.find((s) => s.id === booking.service_id);
  const therapist = state.therapists.find((t) => t.id === booking.therapist_id);
  const payment = state.payments.find((p) => p.booking_id === booking.id);

  res.json({
    booking: {
      ...booking,
      service_name: service?.name || 'Individual Therapy',
      therapist_name: therapist?.full_name || 'Assigned Therapist',
      therapist_title: therapist?.title || '',
      payment_status: payment?.status || 'PENDING',
      payment_reference: payment?.provider_reference || null,
    },
  });
});

// Admin & Therapist Bookings View
apiRouter.get('/admin/bookings', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'THERAPIST'), (req: Request, res: Response) => {
  const state = db.getState();
  const user = req.user!;

  let filteredBookings = [...state.bookings];

  // If user is a therapist, isolate strictly to their sessions!
  if (user.roles.includes('THERAPIST') && !user.roles.includes('SUPER_ADMIN') && !user.roles.includes('ADMIN')) {
    if (!user.therapist_id) {
      res.json({ bookings: [] });
      return;
    }
    filteredBookings = filteredBookings.filter((b) => b.therapist_id === user.therapist_id);
  }

  const enhanced = filteredBookings.map((b) => {
    const service = state.services.find((s) => s.id === b.service_id);
    const therapist = state.therapists.find((t) => t.id === b.therapist_id);
    const payment = state.payments.find((p) => p.booking_id === b.id);
    const settlement = state.settlements.find((s) => s.booking_id === b.id);
    // Least-privilege clinical protection:
    // Only BUSINESS_OWNER_ADMIN or the assigned THERAPIST can view private clinical notes.
    // PLATFORM_ADMIN (Stephen/technical admin) has maintenance access without unnecessary clinical note exposure.
    const canViewClinicalNotes =
      user.roles.includes('BUSINESS_OWNER_ADMIN') ||
      user.roles.includes('SUPER_ADMIN') ||
      (user.roles.includes('THERAPIST') && user.therapist_id === b.therapist_id);

    const safeNotes = canViewClinicalNotes
      ? b.client_notes
      : b.client_notes
      ? '[Confidential clinical intake note — Protected under privacy policy]'
      : '';

    return {
      ...b,
      client_notes: safeNotes,
      service_name: service?.name || 'Counselling Session',
      therapist_name: therapist?.full_name || 'Assigned Practitioner',
      payment,
      settlement,
    };
  });

  res.json({ bookings: enhanced });
});

// Endpoint to generate structured WhatsApp confirmation text for client or Care Team
apiRouter.get('/bookings/:id/whatsapp-link', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'THERAPIST'), (req: Request, res: Response) => {
  const { id } = req.params;
  const state = db.getState();
  const booking = state.bookings.find((b) => b.id === id || b.booking_reference === id);

  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  if (req.user?.roles.includes('THERAPIST') && req.user.therapist_id !== booking.therapist_id) {
    res.status(403).json({ error: 'You can only access links for your own appointments.' });
    return;
  }

  const service = state.services.find((s) => s.id === booking.service_id);
  const therapist = state.therapists.find((t) => t.id === booking.therapist_id);
  const settings = state.business_settings;

  const careWhatsApp = (settings.whatsapp_number || '0710759422').replace(/[^0-9]/g, '');
  const cleanCareNumber = careWhatsApp.startsWith('0') ? `254${careWhatsApp.slice(1)}` : careWhatsApp;

  const clientText = `🌿 *BE SAWA Appointment Confirmation*\n\n` +
    `Hello *${booking.client_name}*,\n` +
    `Your appointment has been confirmed with Be Sawa.\n\n` +
    `• *Booking Ref:* ${booking.booking_reference}\n` +
    `• *Service:* ${service?.name || 'Counselling'}\n` +
    `• *Practitioner:* ${therapist?.full_name || 'Assigned Practitioner'}\n` +
    `• *Date & Time:* ${booking.date} at ${booking.time} (EAT)\n` +
    `• *Format:* ${booking.delivery_mode === 'ONLINE' ? 'Telehealth (Video Link)' : 'In-Person (Kilimani, Nairobi)'}\n` +
    `• *Amount:* ${booking.currency} ${booking.amount.toLocaleString()}\n\n` +
    `If you need to reschedule or speak with our care team, reply directly on this chat.`;

  const clientWhatsAppUrl = `https://wa.me/${cleanCareNumber}?text=${encodeURIComponent(clientText)}`;

  res.json({
    bookingReference: booking.booking_reference,
    messageText: clientText,
    whatsappUrl: clientWhatsAppUrl,
  });
});

apiRouter.patch('/admin/bookings/:id/status', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'THERAPIST'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, cancellation_reason } = req.body;

  const validStatuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REFUNDED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const existingBooking = db.getState().bookings.find((booking) => booking.id === id);
  if (!existingBooking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  if (req.user?.roles.includes('THERAPIST') && req.user.therapist_id !== existingBooking.therapist_id) {
    res.status(403).json({ error: 'You can only update your own appointments.' });
    return;
  }

  const now = new Date().toISOString();
  let found = false;

  db.mutate((draft) => {
    const bk = draft.bookings.find((b) => b.id === id);
    if (bk) {
      found = true;
      bk.status = status;
      if (status === 'COMPLETED') {
        bk.completed_at = now;
        // Approve settlement if completed
        const stl = draft.settlements.find((s) => s.booking_id === id);
        if (stl && stl.settlement_status === 'PENDING') {
          stl.settlement_status = 'APPROVED';
          stl.updated_at = now;
        }
      } else if (status === 'CANCELLED') {
        bk.cancelled_at = now;
        bk.cancellation_reason = cancellation_reason || 'Cancelled by administration';
        // Cancel settlement
        const stl = draft.settlements.find((s) => s.booking_id === id);
        if (stl) {
          stl.settlement_status = 'CANCELLED';
          stl.updated_at = now;
        }
      }
      bk.updated_at = now;
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  db.logAudit('BOOKING_STATUS_CHANGED', 'BOOKING', id, { status, cancellation_reason }, req.user?.id, req.user?.email);
  res.json({ success: true, status });
});

// Admin Manual Appointment Booking (Walk-in, Phone, WhatsApp)
apiRouter.post('/admin/bookings', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const {
    service_id,
    therapist_id,
    date,
    time,
    delivery_mode,
    client_name,
    client_phone,
    client_email,
    client_notes,
    status,
    amount,
  } = req.body;

  if (!service_id || !therapist_id || !date || !time || !client_name?.trim() || !client_phone?.trim()) {
    res.status(400).json({ error: 'Service, therapist, date, time, client name, and phone are required.' });
    return;
  }

  const state = db.getState();
  const therapist = state.therapists.find((t) => t.id === therapist_id);
  const service = state.services.find((s) => s.id === service_id);

  if (!therapist || !service) {
    res.status(400).json({ error: 'Valid therapist and service must be selected.' });
    return;
  }

  const price = isPositiveNumber(amount) ? Number(amount) : (therapist.session_rate_override || service.price);
  const bookingRef = `BS-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const newBooking = {
    id,
    booking_reference: bookingRef,
    service_id,
    therapist_id,
    date,
    time,
    duration_minutes: service.duration_minutes || 50,
    amount: price,
    currency: service.currency || 'KES',
    delivery_mode: delivery_mode || 'ONLINE',
    client_name: client_name.trim(),
    client_phone: client_phone.trim(),
    client_email: (client_email || '').trim(),
    client_notes: client_notes || 'Booked directly via administrative command.',
    status: status || 'CONFIRMED',
    cancellation_reason: null,
    cancelled_at: null,
    completed_at: status === 'COMPLETED' ? now : null,
    created_at: now,
    updated_at: now,
  };

  db.mutate((draft) => {
    draft.bookings.push(newBooking);
  });

  db.logAudit('ADMIN_BOOKING_CREATED', 'BOOKING', id, { booking_reference: bookingRef, client_name, date, time }, req.user?.id, req.user?.email);
  res.status(201).json({ success: true, booking: newBooking });
});

// Admin Reschedule & Update Booking Details
apiRouter.patch('/admin/bookings/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const allowedFields = ['date', 'time', 'delivery_mode', 'service_id', 'therapist_id', 'client_name', 'client_phone', 'client_email', 'client_notes', 'amount'];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => allowedFields.includes(k)));

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No editable fields provided.' });
    return;
  }

  const now = new Date().toISOString();
  let found = false;

  db.mutate((draft) => {
    const b = draft.bookings.find((x) => x.id === id);
    if (b) {
      found = true;
      Object.assign(b, updates, { updated_at: now });
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  db.logAudit('BOOKING_MODIFIED', 'BOOKING', id, updates, req.user?.id, req.user?.email);
  res.json({ success: true, message: 'Appointment details updated successfully.' });
});

// Admin Delete Booking
apiRouter.delete('/admin/bookings/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;
  let bookingRef = '';

  db.mutate((draft) => {
    const idx = draft.bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      bookingRef = draft.bookings[idx].booking_reference;
      draft.bookings.splice(idx, 1);
      // Clean up any pending settlement
      draft.settlements = draft.settlements.filter((s) => s.booking_id !== id);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  db.logAudit('BOOKING_DELETED', 'BOOKING', id, { booking_reference: bookingRef }, req.user?.id, req.user?.email);
  res.json({ success: true, message: `Booking "${bookingRef}" removed from ledger.` });
});

// ====================================================================
// 7. PAYMENTS & M-PESA
// ====================================================================

apiRouter.post('/payments/mpesa/stk-push', async (req: Request, res: Response) => {
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    res.status(410).json({ error: 'Automated payments are paused. Please complete payment verification with the Be Sawa care team on WhatsApp.' });
    return;
  }
  try {
    const { bookingId, phoneNumber } = req.body;
    if (!bookingId || !phoneNumber) {
      res.status(400).json({ error: 'bookingId and phoneNumber are required.' });
      return;
    }

    const result = await initiateMpesaPayment(bookingId, phoneNumber);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Real Safaricom Daraja Webhook Callback Receiver
apiRouter.post('/payments/mpesa/callback', (req: Request, res: Response) => {
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    res.status(410).json({ ResultCode: 1, ResultDesc: 'Automated payments are disabled.' });
    return;
  }
  try {
    const body = req.body;
    console.log('Daraja Callback Received:', JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid payload' });
      return;
    }

    const resultCode = stkCallback.ResultCode;
    const checkoutRequestID = stkCallback.CheckoutRequestID;

    // Find payment with this checkout ID or pending status
    const state = db.getState();
    const payment = state.payments.find((p) => p.status === 'PENDING');

    if (payment) {
      if (resultCode === 0) {
        // Success
        const items = stkCallback.CallbackMetadata?.Item || [];
        const receiptItem = items.find((i: any) => i.Name === 'MpesaReceiptNumber');
        const receipt = receiptItem ? receiptItem.Value : `DAR-${Date.now()}`;
        verifyAndConfirmPayment(payment.booking_id, receipt, 'daraja_webhook');
      } else {
        // Failed / Cancelled by user
        db.mutate((draft) => {
          const p = draft.payments.find((x) => x.id === payment.id);
          if (p) {
            p.status = 'FAILED';
            p.failure_reason = stkCallback.ResultDesc || 'Transaction declined by user';
          }
          const b = draft.bookings.find((x) => x.id === payment.booking_id);
          if (b) {
            b.status = 'PAYMENT_FAILED';
          }
        });
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Callback processed successfully' });
  } catch (err: any) {
    console.error('Error in Daraja callback:', err);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Internal error' });
  }
});

// Explicit Sandbox Verification for Dev/Testing (No fake silent button clicks)
apiRouter.post('/payments/verify-test', (req: Request, res: Response) => {
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    res.status(410).json({ error: 'Automated payment verification is disabled while WhatsApp payment confirmation is active.' });
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'This testing endpoint is not available.' });
    return;
  }
  try {
    const { bookingId, transactionReference } = req.body;
    if (!bookingId) {
      res.status(400).json({ error: 'bookingId is required.' });
      return;
    }

    const receipt = transactionReference || `MP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const result = verifyAndConfirmPayment(bookingId, receipt, 'sandbox_explicit_verification');

    res.json({
      success: true,
      message: `Payment confirmed via simulated Daraja receipt ${receipt}.`,
      result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/payments/status/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const state = db.getState();
  const payment = state.payments.find((p) => p.booking_id === bookingId);
  const booking = state.bookings.find((b) => b.id === bookingId);

  res.json({
    booking_status: booking ? booking.status : 'UNKNOWN',
    payment: payment
      ? { status: payment.status, provider_reference: payment.provider_reference, completed_at: payment.completed_at }
      : null,
  });
});

// ====================================================================
// 8. SETTLEMENTS
// ====================================================================

apiRouter.get('/admin/settlements', authMiddleware, (req: Request, res: Response) => {
  const state = db.getState();
  const user = req.user!;

  let list = [...state.settlements];

  // If therapist, only view own settlements
  if (user.roles.includes('THERAPIST') && !user.roles.includes('SUPER_ADMIN') && !user.roles.includes('ADMIN')) {
    if (!user.therapist_id) {
      res.json({ settlements: [] });
      return;
    }
    list = list.filter((s) => s.therapist_id === user.therapist_id);
  }

  const enhanced = list.map((s) => {
    const booking = state.bookings.find((b) => b.id === s.booking_id);
    const therapist = state.therapists.find((t) => t.id === s.therapist_id);
    const service = booking ? state.services.find((x) => x.id === booking.service_id) : null;
    return {
      ...s,
      client_name: booking?.client_name || 'Client',
      session_date: booking?.date || '',
      service_name: service?.name || 'Session',
      therapist_name: therapist?.full_name || 'Practitioner',
    };
  });

  res.json({ settlements: enhanced });
});

apiRouter.patch('/admin/settlements/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { settlement_status, payout_reference, admin_notes } = req.body;

  const valid = ['PENDING', 'APPROVED', 'PAID', 'ON_HOLD', 'CANCELLED'];
  if (!valid.includes(settlement_status)) {
    res.status(400).json({ error: `Invalid settlement status. Must be one of: ${valid.join(', ')}` });
    return;
  }

  const now = new Date().toISOString();
  let found = false;

  db.mutate((draft) => {
    const s = draft.settlements.find((x) => x.id === id);
    if (s) {
      found = true;
      s.settlement_status = settlement_status;
      if (payout_reference) s.payout_reference = payout_reference;
      if (admin_notes) s.admin_notes = admin_notes;
      if (settlement_status === 'PAID') {
        s.paid_at = now;
      }
      s.updated_at = now;
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Settlement record not found.' });
    return;
  }

  db.logAudit('SETTLEMENT_UPDATED', 'SETTLEMENT', id, { settlement_status, payout_reference }, req.user?.id, req.user?.email);
  res.json({ success: true, settlement_status });
});

// ====================================================================
// 9. ADMIN METRICS & AUDIT LOGS
// ====================================================================

apiRouter.get('/admin/metrics', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  const today = new Date().toISOString().split('T')[0];

  const todaySessions = state.bookings.filter((b) => b.date === today && b.status === 'CONFIRMED').length;
  const pendingBookings = state.bookings.filter((b) => b.status === 'PENDING_CONFIRMATION' || b.status === 'PENDING_PAYMENT').length;
  const confirmedBookings = state.bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedSessions = state.bookings.filter((b) => b.status === 'COMPLETED').length;

  // Real financial aggregates from confirmed/completed payments only
  const confirmedPayments = state.payments.filter((p) => p.status === 'CONFIRMED');
  const grossRevenue = confirmedPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const settlements = state.settlements.filter((s) => s.settlement_status !== 'CANCELLED');
  const platformRetainedRevenue = settlements.reduce((acc, s) => acc + (Number(s.platform_commission_amount) || 0), 0);
  const therapistPayableTotal = settlements.reduce((acc, s) => acc + (Number(s.therapist_payable_amount) || 0), 0);
  const outstandingSettlements = settlements.filter((s) => s.settlement_status === 'APPROVED' || s.settlement_status === 'PENDING').length;

  res.json({
    todaySessions,
    pendingBookings,
    confirmedBookings,
    completedSessions,
    grossRevenue,
    platformRetainedRevenue,
    therapistPayableTotal,
    outstandingSettlements,
  });
});

apiRouter.get('/admin/audit-logs', authMiddleware, requireRoles('SUPER_ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ logs: state.audit_logs.slice(0, 50) });
});

apiRouter.get('/admin/settings', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ settings: state.business_settings });
});

apiRouter.put('/admin/settings', authMiddleware, requireRoles('SUPER_ADMIN'), (req: Request, res: Response) => {
  const updates = req.body;
  db.mutate((draft) => {
    Object.assign(draft.business_settings, updates);
  });
});

// ====================================================================
// 9B. CLIENT INTELLIGENCE & CLINICAL RETENTION
// ====================================================================

apiRouter.get('/admin/clients', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  const profilesMap = new Map<string, any>();
  const clientNotesMap = new Map<string, string>();

  (state.client_profiles || []).forEach((cp: any) => {
    if (cp.phone) clientNotesMap.set(normalizedPhone(cp.phone), cp.care_notes || '');
  });

  for (const b of state.bookings) {
    const key = normalizedPhone(b.client_phone) || b.client_email?.toLowerCase() || b.client_name.toLowerCase();
    if (!profilesMap.has(key)) {
      profilesMap.set(key, {
        phone: b.client_phone,
        name: b.client_name,
        email: b.client_email || '',
        total_bookings: 0,
        completed_sessions: 0,
        cancelled_sessions: 0,
        total_spend_kes: 0,
        first_session_date: b.date,
        latest_session_date: b.date,
        deliveryModes: [] as string[],
        care_notes: clientNotesMap.get(normalizedPhone(b.client_phone)) || '',
      });
    }

    const prof = profilesMap.get(key);
    prof.total_bookings += 1;
    if (b.status === 'COMPLETED') prof.completed_sessions += 1;
    if (b.status === 'CANCELLED') prof.cancelled_sessions += 1;
    if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
      prof.total_spend_kes += (Number(b.amount) || 0);
    }
    if (b.date < prof.first_session_date) prof.first_session_date = b.date;
    if (b.date > prof.latest_session_date) prof.latest_session_date = b.date;
    prof.deliveryModes.push(b.delivery_mode);
  }

  const clients = Array.from(profilesMap.values()).map((p) => {
    const onlineCount = p.deliveryModes.filter((m: string) => m === 'ONLINE').length;
    const inPersonCount = p.deliveryModes.filter((m: string) => m === 'IN_PERSON').length;
    const preferred_delivery_mode = onlineCount > inPersonCount ? 'ONLINE' : inPersonCount > onlineCount ? 'IN_PERSON' : 'MIXED';

    let lifecycle_tier = 'FIRST_TIME';
    if (p.total_bookings >= 5) lifecycle_tier = 'LONG_TERM_CARE';
    else if (p.total_bookings >= 2) lifecycle_tier = 'RETURNING';

    const { deliveryModes, ...rest } = p;
    return {
      ...rest,
      preferred_delivery_mode,
      lifecycle_tier,
    };
  });

  res.json({ clients });
});

apiRouter.get('/admin/clients/:phone', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  const searchPhone = normalizedPhone(req.params.phone);
  const clientBookings = state.bookings
    .filter((b) => normalizedPhone(b.client_phone) === searchPhone || b.client_phone === req.params.phone)
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

  if (clientBookings.length === 0) {
    res.status(404).json({ error: 'Client record not found.' });
    return;
  }

  const first = clientBookings[clientBookings.length - 1];
  const latest = clientBookings[0];
  const totalSpend = clientBookings
    .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const completedCount = clientBookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = clientBookings.filter((b) => b.status === 'CANCELLED').length;

  const profileNote = (state.client_profiles || []).find((cp: any) => normalizedPhone(cp.phone) === searchPhone);

  let lifecycle_tier = 'FIRST_TIME';
  if (clientBookings.length >= 5) lifecycle_tier = 'LONG_TERM_CARE';
  else if (clientBookings.length >= 2) lifecycle_tier = 'RETURNING';

  const onlineCount = clientBookings.filter((b) => b.delivery_mode === 'ONLINE').length;
  const inPersonCount = clientBookings.filter((b) => b.delivery_mode === 'IN_PERSON').length;
  const preferredMode = onlineCount > inPersonCount ? 'ONLINE' : inPersonCount > onlineCount ? 'IN_PERSON' : 'MIXED';

  res.json({
    profile: {
      phone: latest.client_phone,
      name: latest.client_name,
      email: latest.client_email,
      total_bookings: clientBookings.length,
      completed_sessions: completedCount,
      cancelled_sessions: cancelledCount,
      total_spend_kes: totalSpend,
      first_session_date: first.date,
      latest_session_date: latest.date,
      preferred_delivery_mode: preferredMode,
      lifecycle_tier,
      care_notes: profileNote?.care_notes || '',
      bookings: clientBookings,
    },
  });
});

apiRouter.patch('/admin/clients/:phone/notes', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { phone } = req.params;
  const { care_notes } = req.body;
  const searchPhone = normalizedPhone(phone);

  db.mutate((draft) => {
    draft.client_profiles = draft.client_profiles || [];
    let prof = draft.client_profiles.find((p: any) => normalizedPhone(p.phone) === searchPhone);
    if (!prof) {
      prof = {
        phone,
        care_notes: String(care_notes || '').trim(),
        updated_at: new Date().toISOString(),
      };
      draft.client_profiles.push(prof);
    } else {
      prof.care_notes = String(care_notes || '').trim();
      prof.updated_at = new Date().toISOString();
    }
  });

  db.logAudit('CLIENT_CARE_NOTES_UPDATED', 'CLIENT', searchPhone, { care_notes }, req.user?.id, req.user?.email);
  res.json({ success: true, message: 'Care coordination notes saved.' });
});

apiRouter.get('/admin/analytics', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();

  // 1. Daily trend for last 14 days
  const now = new Date();
  const dailyPoints: any[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit' });

    const daysBookings = state.bookings.filter((b) => b.date === dateStr);
    const rev = daysBookings
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    dailyPoints.push({
      date: dateStr,
      label: dayLabel,
      revenue: rev,
      bookingsCount: daysBookings.length,
    });
  }

  // 2. Category Distribution
  const catMap = new Map<string, { name: string; count: number; revenue: number }>();
  state.service_categories.forEach((c) => {
    catMap.set(c.id, { name: c.name, count: 0, revenue: 0 });
  });

  let totalValidBookings = 0;
  state.bookings.forEach((b) => {
    const srv = state.services.find((s) => s.id === b.service_id);
    const catId = srv?.category_id || 'general';
    if (!catMap.has(catId)) {
      catMap.set(catId, { name: srv?.category_name || 'General Care', count: 0, revenue: 0 });
    }
    const item = catMap.get(catId)!;
    item.count += 1;
    if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
      item.revenue += (Number(b.amount) || 0);
    }
    totalValidBookings += 1;
  });

  const categoryDistribution = Array.from(catMap.entries()).map(([id, data]) => ({
    categoryId: id,
    name: data.name,
    count: data.count,
    percentage: totalValidBookings > 0 ? Math.round((data.count / totalValidBookings) * 100) : 0,
    revenue: data.revenue,
  })).filter((c) => c.count > 0 || c.name === 'Individual Care');

  // 3. Therapist Clinical Utilization
  const verifiedTherapists = state.therapists.filter((t) => t.is_active);
  const therapistUtilization = verifiedTherapists.map((t) => {
    const booked = state.bookings.filter((b) => b.therapist_id === t.id && b.status !== 'CANCELLED').length;
    const capacity = 20; // 20 slots/week baseline
    const rate = Math.min(100, Math.round((booked / capacity) * 100));
    return {
      therapistId: t.id,
      name: t.full_name,
      bookedSessions: booked,
      capacitySlots: capacity,
      utilizationRate: rate,
    };
  });

  // 4. Delivery format split
  const onlineCount = state.bookings.filter((b) => b.delivery_mode === 'ONLINE').length;
  const inPersonCount = state.bookings.filter((b) => b.delivery_mode === 'IN_PERSON').length;
  const totalDelivery = onlineCount + inPersonCount || 1;
  const onlinePercent = Math.round((onlineCount / totalDelivery) * 100);
  const inPersonPercent = Math.round((inPersonCount / totalDelivery) * 100);

  const totalRevenue = state.bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const totalCompleted = state.bookings.filter((b) => b.status === 'COMPLETED').length;

  res.json({
    dailyRevenueTrend: dailyPoints,
    categoryDistribution,
    therapistUtilization,
    deliveryModeSplit: {
      onlineCount,
      inPersonCount,
      onlinePercent,
      inPersonPercent,
    },
    totalRevenue,
    totalCompleted,
  });
});

// ====================================================================
// 10. CONTENT & CONTACT
// ====================================================================

apiRouter.get('/content/faqs', (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ faqs: state.faqs.filter((f) => f.is_published) });
});

apiRouter.get('/content/testimonials', (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ testimonials: state.testimonials.filter((t) => t.is_published) });
});

apiRouter.post('/content/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  const id = `msg_${Date.now()}`;
  db.mutate((draft) => {
    draft.contact_messages.push({
      id,
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      is_resolved: false,
      created_at: new Date().toISOString(),
    });
  });

  db.logAudit('CONTACT_MESSAGE_RECEIVED', 'CONTACT', id, { name, email, subject });
  res.json({ success: true, message: 'Your message has been received with care. We will reach out shortly.' });
});

// Admin FAQs Management
apiRouter.get('/admin/faqs', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ faqs: state.faqs });
});

apiRouter.post('/admin/faqs', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { question, answer, category, is_published, display_order } = req.body;
  if (!question?.trim() || !answer?.trim()) {
    res.status(400).json({ error: 'Question and answer are required.' });
    return;
  }

  const id = `faq_${Date.now()}`;
  const now = new Date().toISOString();

  db.mutate((draft) => {
    draft.faqs.push({
      id,
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'General',
      is_published: is_published !== false,
      display_order: Number(display_order) || draft.faqs.length + 1,
      created_at: now,
    });
  });

  db.logAudit('FAQ_CREATED', 'FAQ', id, { question }, req.user?.id, req.user?.email);
  res.status(201).json({ success: true, faqId: id });
});

apiRouter.patch('/admin/faqs/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body || {};
  let found = false;

  db.mutate((draft) => {
    const f = draft.faqs.find((x) => x.id === id);
    if (f) {
      found = true;
      Object.assign(f, updates);
    }
  });

  if (!found) {
    res.status(404).json({ error: 'FAQ not found.' });
    return;
  }

  db.logAudit('FAQ_UPDATED', 'FAQ', id, updates, req.user?.id, req.user?.email);
  res.json({ success: true });
});

apiRouter.delete('/admin/faqs/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  db.mutate((draft) => {
    const idx = draft.faqs.findIndex((x) => x.id === id);
    if (idx !== -1) {
      draft.faqs.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'FAQ not found.' });
    return;
  }

  db.logAudit('FAQ_DELETED', 'FAQ', id, {}, req.user?.id, req.user?.email);
  res.json({ success: true, message: 'FAQ deleted.' });
});

// Admin Testimonials Management
apiRouter.get('/admin/testimonials', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ testimonials: state.testimonials });
});

apiRouter.post('/admin/testimonials', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { client_alias, quote, session_category, is_verified, is_published } = req.body;
  if (!client_alias?.trim() || !quote?.trim()) {
    res.status(400).json({ error: 'Client alias and quote are required.' });
    return;
  }

  const id = `tst_${Date.now()}`;
  const now = new Date().toISOString();

  db.mutate((draft) => {
    draft.testimonials.push({
      id,
      client_alias: client_alias.trim(),
      quote: quote.trim(),
      session_category: session_category || 'Individual Care',
      is_verified: is_verified !== false,
      is_published: is_published !== false,
      created_at: now,
    });
  });

  db.logAudit('TESTIMONIAL_CREATED', 'TESTIMONIAL', id, { client_alias }, req.user?.id, req.user?.email);
  res.status(201).json({ success: true, testimonialId: id });
});

apiRouter.patch('/admin/testimonials/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body || {};
  let found = false;

  db.mutate((draft) => {
    const t = draft.testimonials.find((x) => x.id === id);
    if (t) {
      found = true;
      Object.assign(t, updates);
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Testimonial not found.' });
    return;
  }

  db.logAudit('TESTIMONIAL_UPDATED', 'TESTIMONIAL', id, updates, req.user?.id, req.user?.email);
  res.json({ success: true });
});

apiRouter.delete('/admin/testimonials/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  db.mutate((draft) => {
    const idx = draft.testimonials.findIndex((x) => x.id === id);
    if (idx !== -1) {
      draft.testimonials.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Testimonial not found.' });
    return;
  }

  db.logAudit('TESTIMONIAL_DELETED', 'TESTIMONIAL', id, {}, req.user?.id, req.user?.email);
  res.json({ success: true, message: 'Testimonial deleted.' });
});

// Admin Client Inquiries (Contact Form Submissions)
apiRouter.get('/admin/contact-messages', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ messages: state.contact_messages.slice().reverse() });
});

apiRouter.patch('/admin/contact-messages/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_resolved } = req.body;
  let found = false;

  db.mutate((draft) => {
    const m = draft.contact_messages.find((x) => x.id === id);
    if (m) {
      found = true;
      m.is_resolved = Boolean(is_resolved);
    }
  });

  if (!found) {
    res.status(404).json({ error: 'Message not found.' });
    return;
  }

  db.logAudit('CONTACT_MESSAGE_STATUS_CHANGED', 'CONTACT', id, { is_resolved }, req.user?.id, req.user?.email);
  res.json({ success: true });
});

apiRouter.delete('/admin/contact-messages/:id', authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  db.mutate((draft) => {
    const idx = draft.contact_messages.findIndex((x) => x.id === id);
    if (idx !== -1) {
      draft.contact_messages.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Message not found.' });
    return;
  }

  db.logAudit('CONTACT_MESSAGE_DELETED', 'CONTACT', id, {}, req.user?.id, req.user?.email);
  res.json({ success: true, message: 'Message removed.' });
});

