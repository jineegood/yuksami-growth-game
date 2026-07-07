import { vocabulary } from '../data/vocabulary';
import type { QuizResult, QuizSession, VocabularyEntry } from '../types/game';

interface CreateQuizOptions {
  count?: number;
  choiceCount?: number;
  passScore?: number;
  seed?: number;
  fixedStartIndex?: number;
  entries?: VocabularyEntry[];
}

export function createQuizSession(options: CreateQuizOptions = {}): QuizSession {
  const entries = options.entries ?? vocabulary;
  const count = options.count ?? 3;
  const choiceCount = options.choiceCount ?? 4;
  const passScore = options.passScore ?? 2;
  const random = createRandom(options.seed ?? Date.now() + Math.floor(Math.random() * 100000));
  const startIndex = options.fixedStartIndex ?? Math.floor(random() * entries.length);
  const picked = Array.from({ length: count }, (_, index) => entries[(startIndex + index) % entries.length]);

  return {
    id: `quiz-${Date.now()}-${Math.floor(random() * 100000)}`,
    passScore,
    createdAt: Date.now(),
    questions: picked.map((entry, questionIndex) => {
      const distractors = entries
        .filter((candidate) => candidate.id !== entry.id && candidate.meaning !== entry.meaning)
        .sort(() => random() - 0.5)
        .slice(0, choiceCount - 1)
        .map((candidate) => candidate.meaning);
      const choices = shuffle([entry.meaning, ...distractors], random);

      return {
        id: `${entry.id}-${questionIndex}-${Math.floor(random() * 100000)}`,
        word: entry.word,
        correctMeaning: entry.meaning,
        choices,
      };
    }),
  };
}

export function gradeQuizSession(quiz: QuizSession, answers: Record<string, string>): QuizResult {
  const correctCount = quiz.questions.reduce((total, question) => {
    return total + (answers[question.id] === question.correctMeaning ? 1 : 0);
  }, 0);

  return {
    correctCount,
    totalCount: quiz.questions.length,
    passed: correctCount >= quiz.passScore,
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function createRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}
