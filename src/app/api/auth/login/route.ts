import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_destin_key_123';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const inputEmail = String(email).replace(/\r/g, '').trim().toLowerCase();
    const inputPassword = String(password).replace(/\r/g, '').trim();

    const envAdminEmail = process.env.ADMIN_EMAIL ? String(process.env.ADMIN_EMAIL).replace(/\r/g, '').trim().toLowerCase() : '';
    const envAdminPassword = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD).replace(/\r/g, '').trim() : '';

    let userObj: { id: string; name: string; email: string; role: string } | null = null;

    // Check if credentials match env ADMIN_EMAIL and ADMIN_PASSWORD
    const isEnvAdmin = Boolean(
      envAdminEmail &&
      envAdminPassword &&
      inputEmail === envAdminEmail &&
      inputPassword === envAdminPassword
    );

    if (isEnvAdmin) {
      try {
        const { data: existingProfile } = await supabaseServer
          .from('profiles')
          .select('*')
          .eq('email', inputEmail)
          .maybeSingle() as any;

        if (existingProfile) {
          if (existingProfile.role !== 'admin') {
            await supabaseServer.from('profiles').update({ role: 'admin' }).eq('id', existingProfile.id);
          }
          try {
            await supabaseServer.auth.admin.updateUserById(existingProfile.id, { password: envAdminPassword, email_confirm: true });
          } catch (e) {
            console.error('Failed to update Supabase auth password for admin:', e);
          }

          userObj = {
            id: existingProfile.id,
            name: existingProfile.name || 'Admin',
            email: existingProfile.email || inputEmail,
            role: 'admin',
          };
        } else {
          let authUserId = '';
          const { data: authData } = await supabaseServer.auth.admin.createUser({
            email: inputEmail,
            password: envAdminPassword,
            email_confirm: true,
          } as any);

          if (authData?.user) {
            authUserId = authData.user.id;
          } else {
            const { data: usersData } = await supabaseServer.auth.admin.listUsers();
            const existingAuthUser = usersData?.users?.find(u => u.email?.toLowerCase() === inputEmail);
            if (existingAuthUser) {
              authUserId = existingAuthUser.id;
              await supabaseServer.auth.admin.updateUserById(authUserId, { password: envAdminPassword, email_confirm: true });
            }
          }

          if (authUserId) {
            const { data: newProfile } = await supabaseServer
              .from('profiles')
              .upsert({
                id: authUserId,
                name: 'Admin',
                email: inputEmail,
                role: 'admin',
              })
              .select()
              .single() as any;

            userObj = {
              id: newProfile?.id || authUserId,
              name: newProfile?.name || 'Admin',
              email: inputEmail,
              role: 'admin',
            };
          } else {
            userObj = {
              id: 'admin',
              name: 'Admin',
              email: inputEmail,
              role: 'admin',
            };
          }
        }
      } catch (err) {
        console.error('Admin sync error:', err);
        userObj = {
          id: 'admin',
          name: 'Admin',
          email: inputEmail,
          role: 'admin',
        };
      }
    } else {
      // Regular user login via Supabase auth
      const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
        email: inputEmail,
        password: inputPassword,
      } as any);

      if (authError || !authData?.user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single() as any;

      const isUserAdmin = profile?.role === 'admin' || (envAdminEmail && inputEmail === envAdminEmail);

      userObj = {
        id: profile?.id || authData.user.id,
        name: profile?.name || authData.user.email?.split('@')[0] || 'User',
        email: profile?.email || inputEmail,
        role: isUserAdmin ? 'admin' : (profile?.role || 'user'),
      };
    }

    const token = jwt.sign(
      { userId: userObj.id, email: userObj.email, role: userObj.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  }
}


