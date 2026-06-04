"use client"
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { STUDY_TYPES } from '@/configs/studyTypes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Inline answer formatter — no external dependency needed
function formatAnswer(answer) {
  if (!answer) return '';
  const parts = answer.split(/```([\s\S]*?)```/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) {
        return `<pre style="background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:0.5rem;overflow-x:auto;margin:0.75rem 0;font-size:0.9rem;"><code>${part.trim()}</code></pre>`;
      }
      return part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(\d+)\.\s/g, '<br/><strong style="color:#3b82f6;">$1.</strong> ');
    })
    .join('');
}

function QnA() {
  const { courseId } = useParams();
  const router = useRouter();
  const [questionData, setQuestionData] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    getQuestion();
  }, []);

  const getQuestion = async () => {
    setIsLoading(true);
    try {
      // FIX: use canonical STUDY_TYPES.QNA constant
      const result = await axios.post('/api/study-type', {
        courseId: courseId,
        studyType: STUDY_TYPES.QNA,
      });
      setQuestionData(result.data);
      // FIX: content may be stored as the full object or as question_bank directly
      const content = result.data?.content;
      const bank = Array.isArray(content)
        ? content
        : content?.question_bank ?? [];
      setQuestionBank(bank);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questionBank[stepCount];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!questionBank.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-lg">No questions found for this course.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-6 text-gray-500 hover:text-gray-800" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
      </Button>

      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Question Bank</h1>
      <p className="text-center text-gray-400 text-sm mb-6">
        Question {stepCount + 1} of {questionBank.length}
      </p>

      {/* Step dots */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {questionBank.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setStepCount(idx); setShowAnswer(false); }}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              idx === stepCount ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed mb-6">
          {currentQuestion?.question}
        </h2>

        {showAnswer ? (
          <div>
            <hr className="mb-4 border-gray-200" />
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Answer</h3>
            <div
              className="text-gray-700 text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatAnswer(currentQuestion?.answer) }}
            />
          </div>
        ) : (
          <Button className="w-full" onClick={() => setShowAnswer(true)}>
            Reveal Answer
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => { setStepCount(s => s - 1); setShowAnswer(false); }}
          disabled={stepCount === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {stepCount < questionBank.length - 1 ? (
          <Button onClick={() => { setStepCount(s => s + 1); setShowAnswer(false); }}>
            Next
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.back()}>
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}

export default QnA;
