export function formatCurrency(value: number, currency: string = 'BRL', language: string = 'pt') {
    const localeMap: Record<string, string> = {
        'pt': 'pt-BR',
        'en': 'en-US',
        'es': 'es-ES'
    };

    return new Intl.NumberFormat(localeMap[language] || 'pt-BR', {
        style: 'currency',
        currency: currency,
    }).format(value);
}

export function formatDate(date: string | Date | null, language: string = 'pt') {
    if (!date) return "-";
    const localeMap: Record<string, string> = {
        'pt': 'pt-BR',
        'en': 'en-US',
        'es': 'es-ES'
    };
    return new Date(date).toLocaleDateString(localeMap[language] || 'pt-BR');
}
