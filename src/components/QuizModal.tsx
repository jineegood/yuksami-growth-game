import { useMemo, useState } from 'react';
import type { PendingLevelUpState } from '../types/game';
import { gradeQuizSession } from '../utils/quiz';

interface QuizModalProps {
  pending: PendingLevelUpState;
  onSubmit: (answers: Record<string, string>) => void;
}

export function QuizModal({ pending, onSubmit }: QuizModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState('');
  const allAnswered = useMemo(
    () => pending.quiz.questions.every((question) => Boolean(answers[question.id])),
    [answers, pending.quiz.questions],
  );

  const submit = () => {
    const result = gradeQuizSession(pending.quiz, answers);
    setRevealed(true);
    setMessage(
      result.passed
        ? `${result.correctCount}/${result.totalCount} 정답! 레벨업 성공`
        : `${result.correctCount}/${result.totalCount} 정답. 정답을 확인해요.`,
    );

    window.setTimeout(() => {
      onSubmit(answers);
    }, 2500);
  };

  return (
    <div className="quiz-backdrop" role="dialog" aria-modal="true" aria-label="레벨업 영어 퀴즈">
      <section className="quiz-modal">
        <div className="quiz-header">
          <span>레벨업 퀴즈</span>
          <strong>
            Lv.{pending.fromLevel} → Lv.{pending.targetLevel}
          </strong>
        </div>
        <p className="quiz-subtitle">3문제 중 2문제 이상 맞히면 레벨업합니다. 제출 후 정답을 2.5초 동안 보여줘요.</p>

        <div className="quiz-list">
          {pending.quiz.questions.map((question, index) => (
            <article className="quiz-question" key={question.id}>
              <div className="quiz-word">
                <small>문제 {index + 1}</small>
                <strong>{question.word}</strong>
              </div>
              <div className="quiz-choices">
                {question.choices.map((choice) => {
                  const isSelected = answers[question.id] === choice;
                  const isCorrect = question.correctMeaning === choice;
                  const className = [
                    isSelected ? 'selected' : '',
                    revealed && isCorrect ? 'correct' : '',
                    revealed && isSelected && !isCorrect ? 'incorrect' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      className={className}
                      disabled={revealed}
                      key={choice}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: choice,
                        }))
                      }
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="quiz-footer">
          <span>{message || '뜻을 고르고 제출하세요.'}</span>
          <button disabled={!allAnswered || revealed} onClick={submit}>
            정답 제출
          </button>
        </div>
      </section>
    </div>
  );
}
