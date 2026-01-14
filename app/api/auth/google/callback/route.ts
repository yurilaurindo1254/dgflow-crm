import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/agenda?error=auth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/agenda?error=no_code', request.url));
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/google/callback'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get User Info (Email)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Save tokens to Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (tokens.refresh_token) {
        // Upsert integration
        const { error: dbError } = await supabase.from('integrations').upsert({
            user_id: user.id,
            provider: 'google',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expiry_date,
            email: userInfo.data.email
        }, {
            onConflict: 'user_id, provider'
        });

        if (dbError) {
             console.error('Supabase error:', dbError);
             return NextResponse.redirect(new URL('/agenda?error=db_error', request.url));
        }
    } else {
         // If no refresh token returned (user already authorized before), we might want to just update access token
         // OR better: force prompt='consent' in init route (which we did)
         if(tokens.access_token) {
            // Partial update if refresh token missing
             const { error: dbError } = await supabase.from('integrations').update({
                access_token: tokens.access_token,
                expires_at: tokens.expiry_date,
                email: userInfo.data.email
            }).eq('user_id', user.id).eq('provider', 'google');
             
             if (dbError) {
                 console.error('Supabase update error:', dbError);
             }
         }
    }

    return NextResponse.redirect(new URL('/agenda?success=connected', request.url));

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/agenda?error=callback_failed', request.url));
  }
}
