import { describe, expect, it } from 'vitest';
import { vocabulary } from '../data/vocabulary';
import { createQuizSession, gradeQuizSession } from './quiz';

describe('quiz helpers', () => {
  it('ships with at least 200 classroom vocabulary words', () => {
    expect(vocabulary.length).toBeGreaterThanOrEqual(200);
  });

  it('creates three multiple choice questions with one correct answer each', () => {
    const quiz = createQuizSession({ seed: 7 });

    expect(quiz.questions).toHaveLength(3);
    for (const question of quiz.questions) {
      expect(question.choices).toHaveLength(4);
      expect(question.choices).toContain(question.correctMeaning);
      expect(new Set(question.choices).size).toBe(4);
    }
  });

  it('can produce different choice orders for the same word with different seeds', () => {
    const first = createQuizSession({ seed: 1, fixedStartIndex: 0 });
    const second = createQuizSession({ seed: 2, fixedStartIndex: 0 });

    expect(first.questions[0].word).toBe(second.questions[0].word);
    expect(first.questions[0].choices.join('|')).not.toBe(second.questions[0].choices.join('|'));
  });

  it('passes when at least two answers are correct', () => {
    const quiz = createQuizSession({ seed: 3 });
    const answers = {
      [quiz.questions[0].id]: quiz.questions[0].correctMeaning,
      [quiz.questions[1].id]: quiz.questions[1].correctMeaning,
      [quiz.questions[2].id]: 'wrong',
    };

    const result = gradeQuizSession(quiz, answers);

    expect(result.correctCount).toBe(2);
    expect(result.passed).toBe(true);
  });
});
