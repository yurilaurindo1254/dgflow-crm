import { supabase } from "../supabase";

interface WebhookSaleData {
  transaction_id: string;
  amount: number;
  currency: string;
  timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string; // Expecting Ad ID here
  utm_term?: string;
  client_id: string;
}

/**
 * attributeSaleToAd
 * 
 * Processa um webhook de venda e atribui o valor e a conversão 
 * ao anúncio/campanha correspondente baseado nas UTMs.
 */
export async function attributeSaleToAd(data: WebhookSaleData) {
  const { 
    utm_source, 
    utm_content, 
    utm_term, 
    amount, 
    client_id 
  } = data;

  console.log(`[Attribution] Processing sale: ${data.transaction_id} for client: ${client_id}`);

  // 1. Identificar a plataforma
  const platform = utm_source?.toLowerCase().includes('facebook') || utm_source?.toLowerCase().includes('instagram') 
    ? 'meta' 
    : utm_source?.toLowerCase().includes('google') 
      ? 'google' 
      : 'organic';

  // 2. Tentar encontrar o ID do anúncio (preferencialmente utm_content ou utm_term)
  const adId = utm_content || utm_term;

  if (platform !== 'organic' && adId) {
    // 3. Buscar o registro corrente na tabela ad_metrics
    // Nota: Em um cenário real, buscaríamos pela data específica e id do anúncio
    const today = new Date().toISOString().split('T')[0];
    
    const { data: metrics, error } = await supabase
      .from('ad_metrics')
      .select('*')
      .eq('client_id', client_id)
      .eq('platform', platform)
      .eq('account_id', adId) // Simplificação: usando account_id como o ID do anúncio/content
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
        console.error('[Attribution] Error fetching metrics:', error);
        return { success: false, error };
    }

    if (metrics) {
        // 4. Update incremental
        const { error: updateError } = await supabase
            .from('ad_metrics')
            .update({
                conversions: (metrics.conversions || 0) + 1,
                revenue: (metrics.revenue || 0) + amount
            })
            .eq('id', metrics.id);
            
        if (updateError) console.error('[Attribution] Update error:', updateError);
    } else {
        // 5. Criar novo registro para hoje se não existir (upsert logic)
        // Isso garante que mesmo sem dados de clique prévios (raro), a venda seja computada
        await supabase.from('ad_metrics').insert({
            client_id,
            platform,
            account_id: adId,
            date: today,
            conversions: 1,
            revenue: amount,
            spend: 0,
            clicks: 0,
            impressions: 0
        });
    }
  }

  // Log de atribuição para auditoria futura
  await supabase.from('audit_logs').insert({
    client_id,
    event: 'sale_attribution',
    metadata: {
        transaction_id: data.transaction_id,
        platform,
        ad_id: adId,
        amount,
        utm_params: { source: utm_source, content: utm_content, term: utm_term }
    }
  });

  return { success: true, platform, attributedId: adId };
}
