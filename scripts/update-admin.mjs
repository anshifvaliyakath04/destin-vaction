import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hnbceauwjvounulkqzzc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYmNlYXV3anZvdW51bGtxenpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE2MjM3MCwiZXhwIjoyMTAxNzM4MzcwfQ.COeYOIpN2kytRJUcGn4EJ5nD9Ce-zLGFlKwf_3Qey_Y';

const NEW_EMAIL = 'admin@gmail.com';
const NEW_PASSWORD = 'Admin@1234';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function updateAdmin() {
  console.log('🔍 Looking for existing admin user...');

  // List all users and find the admin
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  console.log(`Found ${users.length} user(s)`);

  // Find admin by role in profiles table
  const { data: adminProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'admin');

  if (profileError) {
    console.error('❌ Failed to query profiles:', profileError.message);
    process.exit(1);
  }

  console.log('Admin profiles found:', adminProfiles);

  if (!adminProfiles || adminProfiles.length === 0) {
    console.log('⚠️  No admin profile found. Creating new admin user...');

    // Create new admin user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
    });

    if (createError) {
      console.error('❌ Failed to create user:', createError.message);
      process.exit(1);
    }

    // Upsert profile with admin role
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: newUser.user.id,
      email: NEW_EMAIL,
      name: 'Admin',
      role: 'admin',
    });

    if (upsertError) {
      console.error('❌ Failed to upsert profile:', upsertError.message);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${NEW_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    return;
  }

  // Update each existing admin user
  for (const profile of adminProfiles) {
    console.log(`\n📝 Updating admin: ${profile.email} → ${NEW_EMAIL}`);

    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
    });

    if (updateError) {
      console.error(`❌ Failed to update user ${profile.id}:`, updateError.message);
      continue;
    }

    // Update profile email too
    await supabase.from('profiles').update({ email: NEW_EMAIL }).eq('id', profile.id);

    console.log('✅ Admin updated successfully!');
    console.log(`   Email: ${NEW_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
  }
}

updateAdmin().catch(console.error);
