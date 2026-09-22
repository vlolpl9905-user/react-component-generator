import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadApiKey,
  saveApiKey,
  loadProvider,
  saveProvider,
  loadComponents,
  saveComponents,
} from './storage';
import type { GeneratedComponent } from '../types';

beforeEach(() => {
  localStorage.clear();
});

describe('apiKey storage', () => {
  it('저장된 값이 없으면 빈 문자열을 반환한다', () => {
    expect(loadApiKey()).toBe('');
  });

  it('저장 후 불러오면 동일한 값을 반환한다', () => {
    saveApiKey('sk-ant-test');
    expect(loadApiKey()).toBe('sk-ant-test');
  });
});

describe('provider storage', () => {
  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(loadProvider('google')).toBe('google');
  });

  it('저장 후 불러오면 동일한 값을 반환한다', () => {
    saveProvider('anthropic');
    expect(loadProvider('google')).toBe('anthropic');
  });

  it('저장된 값이 유효한 provider가 아니면 기본값을 반환한다', () => {
    localStorage.setItem('rcg:provider', 'invalid-provider');
    expect(loadProvider('google')).toBe('google');
  });
});

describe('components storage', () => {
  const sample: GeneratedComponent[] = [
    { id: '1', prompt: '버튼 만들어줘', code: 'render(<div />)', createdAt: new Date('2026-01-01T00:00:00.000Z') },
  ];

  it('저장된 값이 없으면 빈 배열을 반환한다', () => {
    expect(loadComponents()).toEqual([]);
  });

  it('저장 후 불러오면 동일한 내용을 반환하고 createdAt은 Date 인스턴스다', () => {
    saveComponents(sample);
    const loaded = loadComponents();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('1');
    expect(loaded[0].prompt).toBe('버튼 만들어줘');
    expect(loaded[0].createdAt).toBeInstanceOf(Date);
    expect(loaded[0].createdAt.getTime()).toBe(sample[0].createdAt.getTime());
  });

  it('저장된 값이 손상된 JSON이면 빈 배열을 반환한다', () => {
    localStorage.setItem('rcg:components', '{not valid json');
    expect(loadComponents()).toEqual([]);
  });
});
