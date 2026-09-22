import { describe, it, expect } from 'vitest';
import { MAX_PROMPT_LENGTH, isPromptLengthValid } from './validation';

describe('isPromptLengthValid', () => {
  it('빈 문자열은 유효하다', () => {
    expect(isPromptLengthValid('')).toBe(true);
  });

  it(`${MAX_PROMPT_LENGTH}자는 유효하다`, () => {
    expect(isPromptLengthValid('a'.repeat(MAX_PROMPT_LENGTH))).toBe(true);
  });

  it(`${MAX_PROMPT_LENGTH + 1}자는 유효하지 않다`, () => {
    expect(isPromptLengthValid('a'.repeat(MAX_PROMPT_LENGTH + 1))).toBe(false);
  });
});
