// auth.middleware.js
const { createClient } = require('@supabase/supabase-js');

// Prefer service role for reliable server-side verification.
// Fallback to anon key if service role is not available.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Fail fast so you notice misconfiguration early
  // eslint-disable-next-line no-console
  console.warn('[auth] Missing SUPABASE_URL or SUPABASE_*_KEY in server env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

module.exports = async function verifyAuth(req, res, next) {
  try {
    const h = req.header('Authorization') || '';
    const [scheme, token] = h.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    // Validate and fetch user from Supabase
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid/expired token' });
    }

    // Normalize user id
    req.user = { id: data.user.id }; // same as JWT sub
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
