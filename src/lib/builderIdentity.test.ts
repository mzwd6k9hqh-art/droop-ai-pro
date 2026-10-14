import { describe, expect, it } from 'vitest';
import { builderQuestionKind, builderReply } from '../../supabase/functions/_shared/identity';

describe('builder question routing', () => {
  it('recognizes who built you as an app builder question', () => {
    expect(builderQuestionKind('who built you?')).toBe('builder');
  });
  it('recognizes who made you as an app builder question', () => {
    expect(builderQuestionKind('who made you?')).toBe('builder');
  });
  it('routes the person question separately', () => {
    expect(builderQuestionKind('who is the person who built you?')).toBe('person');
  });
  it('does not override unrelated requests or old identity questions', () => {
    expect(builderReply([{ role: 'user', content: 'who built you?' }, { role: 'assistant', content: 'reply' }, { role: 'user', content: 'Help me code a shop' }])).toBeUndefined();
    expect(builderQuestionKind('Translate "who built you?" into French')).toBeUndefined();
  });
});