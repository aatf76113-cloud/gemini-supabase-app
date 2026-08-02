import { VaultSecret } from '../types';

const INITIAL_SECRETS: VaultSecret[] = [
  {
    id: 'sec-1',
    name: 'Google Gemini AI Key',
    key: 'GEMINI_API_KEY',
    category: 'AI',
    value: 'AIzaSyD9831a_GeminiProKey_Prod',
    isMasked: true,
    status: 'valid',
    lastTestedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: '2026-07-28'
  },
  {
    id: 'sec-2',
    name: 'Stripe Live Secret Key',
    key: 'STRIPE_SECRET_KEY',
    category: 'Payment',
    value: 'sk_live_51M00XXYYZZ991823719827391',
    isMasked: true,
    status: 'valid',
    lastTestedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: '2026-07-25'
  },
  {
    id: 'sec-3',
    name: 'WhatsApp Business API Token',
    key: 'WHATSAPP_CLOUD_TOKEN',
    category: 'Messaging',
    value: 'EAAG99128312_WhatsAppTokenKey',
    isMasked: true,
    status: 'valid',
    lastTestedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: '2026-07-20'
  },
  {
    id: 'sec-4',
    name: 'OpenAI GPT-4o API Key',
    key: 'OPENAI_API_KEY',
    category: 'AI',
    value: 'sk-proj-991283192381293812938',
    isMasked: true,
    status: 'valid',
    lastTestedAt: new Date().toISOString(),
    updatedAt: '2026-07-29'
  }
];

export function getVaultSecrets(): VaultSecret[] {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('zain_vault_secrets');
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error('Failed to load secrets:', err);
  }
  return INITIAL_SECRETS;
}

export function saveVaultSecret(secret: VaultSecret): VaultSecret[] {
  const current = getVaultSecrets();
  const exists = current.some(s => s.id === secret.id || s.key === secret.key);
  let updated: VaultSecret[];
  if (exists) {
    updated = current.map(s => (s.id === secret.id || s.key === secret.key) ? secret : s);
  } else {
    updated = [secret, ...current];
  }
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('zain_vault_secrets', JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Failed to save secret to localStorage:', err);
  }
  return updated;
}

export function deleteVaultSecret(id: string): VaultSecret[] {
  const current = getVaultSecrets();
  const updated = current.filter(s => s.id !== id);
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('zain_vault_secrets', JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Failed to delete secret from localStorage:', err);
  }
  return updated;
}
