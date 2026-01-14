import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch tokens from DB
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .single();

  if (!integration) {
    return NextResponse.json({ connected: false });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: integration.expires_at,
  });

  // Check if token needs refresh
  // googleapis handles auto-refresh if refresh_token is present, but we should listen to 'tokens' event to update DB
  // However, simpler way here is to just let it refresh and capture new tokens if possible, or just trust the lib
  
  // To manually handle potential refresh token updates, we can wrap the call
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
       const updates: any = {
           access_token: tokens.access_token,
           expires_at: tokens.expiry_date
       };
       if (tokens.refresh_token) {
           updates.refresh_token = tokens.refresh_token; 
       }

       await supabase
        .from('integrations')
        .update(updates)
        .eq('user_id', user.id)
        .eq('provider', 'google');
    }
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json({ 
        connected: true, 
        events: response.data.items 
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    // If error is 'invalid_grant', tokens might be revoked. We should probably return connected: false or error.
    return NextResponse.json({ error: 'Failed to fetch events', connected: true }, { status: 500 });
  }
}
