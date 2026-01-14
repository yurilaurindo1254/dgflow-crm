import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ 
      error: 'Google credentials missing. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local' 
    }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/api/auth/google/callback'
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent select_account' // Forces refresh_token generation and account selection
  });

  return NextResponse.redirect(url);
}
