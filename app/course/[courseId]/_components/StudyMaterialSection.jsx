import React, { useEffect, useState } from 'react'
import MaterialCardItem from './MaterialCardItem'
import Link from 'next/link'
import axios from 'axios';

function StudyMaterialSection({courseId,course}) {

    const [studyTypeContent, setstudyTypeContent] = useState();

    const MaterialList=[
        {
        name: 'Notes/Chapters', 
        desc:"These are the notes for your preparation",
        icon:"/notes.jpg", 
        path:'/notes',
         type:'notes'
        },
        {
            name: 'Flashcard', 
            desc:"These are the Flashcards for quick revision",
            icon:"/flashcards.png", 
            path:'/flashCard',
             type:'flashCard'
           
        },
        {
            name: 'Quizzes', 
            desc:"Quizzes for your testing your preparation",
            icon:"/quiz.jpg", 
            path:'/quiz',
            type:'quiz',
        }
    ]

    useEffect(()=>{
        GetStudyMaterial();
    },[])


    const GetStudyMaterial=async()=>{

        const result = await axios.post('/api/study-type',{
            courseId:courseId,
            studyType:'ALL',

        })
        console.log(result.data)
        setstudyTypeContent(result.data)
    }
  return (
    <div className='mt-5'>
        <h2 className='font-medium text-2xl mb-4'>Your Study Material</h2>
        {/* Added grid layout to align cards side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {MaterialList.map((item,index)=>(
               
                    <MaterialCardItem item={item} key={index} studyTypeContent={studyTypeContent} course={course} refreshData={GetStudyMaterial}/>
                
            ))}
        </div>
    </div>
  )
}

export default StudyMaterialSection
