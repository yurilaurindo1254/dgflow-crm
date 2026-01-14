import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Typically contains client_id or session info

  const supabase = await createClient();

  // 1. Initial Redirect to Meta Auth (if no code)
  if (!code) {
    const clientId = process.env.META_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/meta`;
    const scope = 'ads_read,ads_management,business_management';
    
    // In a real app, 'state' should be a CSRF token
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=placeholder`;
    
    return NextResponse.redirect(authUrl);
  }

  // 2. Handle Callback (exchange code for token)
  try {
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/meta`;

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`
    );

    const data = await tokenResponse.json();

    if (data.error) throw new Error(data.error.message);

    const { access_token, expires_in } = data;

    // Get current user to link the integration
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's client_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', user.id)
      .single();

    if (!profile?.client_id) {
      return NextResponse.json({ error: 'User has no associated client' }, { status: 400 });
    }

    // Save or update integration
    const { error: dbError } = await supabase
      .from('marketing_integrations')
      .upsert({
        client_id: profile.client_id,
        provider: 'meta',
        account_id: 'pending_selection', // Will be updated when user selects an ad account
        access_token,
        status: 'active',
        expires_at: expires_in ? Date.now() + expires_in * 1000 : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'client_id,provider,account_id' });

    if (dbError) throw dbError;

    // Redirect back to performance page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/performance?success=true`);

  } catch (error: any) {
    console.error('Meta OAuth Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/performance?error=${encodeURIComponent(error.message)}`);
  }
}
