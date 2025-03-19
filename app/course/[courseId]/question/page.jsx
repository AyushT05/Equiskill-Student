"use client"
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import StepProgress from '../_components/StepProgress';
import Questions from './_components/Questions';

function QnA() {
  const { courseId } = useParams();
  const [questionData, setQuestionData] = useState();
  const [question, setQuestion] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getQuestion()
  }, [])

  const getQuestion = async () => {
    try {
      const result = await axios.post('/api/study-type', {
        courseId: courseId,
        studyType: 'Question/Answers'
      });
      setQuestionData(result.data);
      setQuestion(result.data?.content?.question_bank);
      console.log("Question Bank:", result);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl p-10 border border-gray-200">
        <h2 className='font-extrabold text-3xl text-center text-gray-900 mb-6'>📖 Question Bank</h2>

        <StepProgress 
          data={question} 
          stepCount={stepCount} 
          setStepCount={setStepCount} 
        />

        <div className="mt-8">
          <Questions question={question[stepCount]} />
        </div>
      </div>
    </div>
  );
}

export default QnA;
