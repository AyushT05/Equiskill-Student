'use client'
import React, { useEffect } from 'react'
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

function Quiz() {

    useEffect(()=>{
     GetQuiz()   
   },[])
    
const GetQuiz=async()=>{
    const {courseId}=useParams();
    const result=await axios.post('/api/study-type',{
        courseId:courseId,
        studyType:'Quiz'
    });
    console.log(result)
}

  return (
    <div>
        Quiz
    </div>
  )
}

export default Quiz