import type { GeneratedComponent, Provider } from '../types';

const STORAGE_KEYS = {
  apiKey: 'rcg:apiKey',
  provider: 'rcg:provider',
  components: 'rcg:components',
} as const;

export function loadApiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.apiKey) ?? '';
}

export function saveApiKey(apiKey: string): void {
  localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
}

export function loadProvider(fallback: Provider): Provider {
  const stored = localStorage.getItem(STORAGE_KEYS.provider);
  return stored === 'anthropic' || stored === 'google' ? stored : fallback;
}

export function saveProvider(provider: Provider): void {
  localStorage.setItem(STORAGE_KEYS.provider, provider);
}

export function loadComponents(): GeneratedComponent[] {
  const raw = localStorage.getItem(STORAGE_KEYS.components);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as GeneratedComponent[];
    return parsed.map((component) => ({
      ...component,
      createdAt: new Date(component.createdAt),
    }));
  } catch {
    return [];
  }
}

export function saveComponents(components: GeneratedComponent[]): void {
  localStorage.setItem(STORAGE_KEYS.components, JSON.stringify(components));
}
