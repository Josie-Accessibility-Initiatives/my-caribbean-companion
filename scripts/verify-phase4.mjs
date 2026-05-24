// Verify Phase 4 auth state in Supabase.
// Usage:
//   node scripts/verify-phase4.mjs <test-email>
//   node scripts/verify-phase4.mjs trigger          (checks profile auto-create trigger)
//   node scripts/verify-phase4.mjs recent           (lists 5 most-recent auth.users)

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
const env = Object.fromEntries(
  envRaw
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/verify-phase4.mjs <email | "recent" | "trigger">');
  process.exit(1);
}

function ok(label, val) {
  console.log(`  ${label}: ${val}`);
}

if (arg === 'recent') {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 5 });
  if (error) {
    console.error('listUsers failed:', error.message);
    process.exit(1);
  }
  console.log(`Most-recent ${data.users.length} auth.users:`);
  data.users
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .forEach((u) => {
      console.log(`  - ${u.email}  id=${u.id}  created=${u.created_at}  confirmed=${u.email_confirmed_at || 'NO'}`);
    });
  process.exit(0);
}

if (arg === 'trigger') {
  // Check whether a trigger exists on auth.users that auto-creates a profile.
  const { data, error } = await supabase.rpc('pg_trigger_lookup_phase4');
  if (error) {
    console.log('RPC pg_trigger_lookup_phase4 not present; falling back to checking if profiles is created on signup.');
    console.log('(Run signup, then query the user with the email to see if a profile row exists.)');
  } else {
    console.log(data);
  }
  process.exit(0);
}

// Otherwise: treat arg as email
const email = arg;
console.log(`\nLooking up user by email: ${email}\n`);

// auth.users via admin API (no direct query)
const { data: usersList, error: usersErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (usersErr) {
  console.error('listUsers failed:', usersErr.message);
  process.exit(1);
}
const user = usersList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.log(`auth.users:  NOT FOUND (searched ${usersList.users.length} users)`);
  process.exit(0);
}
console.log('auth.users:  FOUND');
ok('id', user.id);
ok('created_at', user.created_at);
ok('email_confirmed_at', user.email_confirmed_at || 'NOT CONFIRMED');
ok('user_metadata', JSON.stringify(user.user_metadata));

// public.profiles
const { data: profiles, error: profErr } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id);
if (profErr) {
  console.log(`\npublic.profiles:  ERROR — ${profErr.message}`);
} else if (!profiles || profiles.length === 0) {
  console.log('\npublic.profiles:  NO ROW (trigger may be missing)');
} else {
  console.log('\npublic.profiles:  FOUND');
  profiles.forEach((p) => console.log('  ', JSON.stringify(p)));
}

// public.plans
const { data: plans, error: plansErr } = await supabase
  .from('plans')
  .select('*')
  .eq('user_id', user.id);
if (plansErr) {
  console.log(`\npublic.plans:  ERROR — ${plansErr.message}`);
} else {
  console.log(`\npublic.plans:  ${plans?.length || 0} row(s)`);
  (plans || []).forEach((p) => {
    console.log(`  - plan_id=${p.plan_id}  from=${p.from_country}  to=${p.to_country}  category=${p.category}  created=${p.created_at}`);
  });
}

// public.checklist_items
const { data: items, error: itemsErr } = await supabase
  .from('checklist_items')
  .select('*')
  .eq('user_id', user.id);
if (itemsErr) {
  console.log(`\npublic.checklist_items:  ERROR — ${itemsErr.message}`);
} else {
  console.log(`\npublic.checklist_items:  ${items?.length || 0} row(s)`);
  (items || []).forEach((it) => {
    console.log(`  - plan=${it.plan_id}  step=${it.step_key}  done=${it.completed}  at=${it.completed_at}`);
  });
}
