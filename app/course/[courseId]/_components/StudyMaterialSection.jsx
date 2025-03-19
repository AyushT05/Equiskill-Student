import React, { useEffect, useState } from 'react';
import MaterialCardItem from './MaterialCardItem';
import axios from 'axios';

function StudyMaterialSection({ courseId, course }) {
    const [studyTypeContent, setStudyTypeContent] = useState();

    const MaterialList = [
        {
            name: 'Notes/Chapters',
            desc: "These are the notes for your preparation",
            icon: "/notes.jpg",
            path: '/notes',
            type: 'notes'
        },
        {
            name: 'Flashcard',
            desc: "These are the Flashcards for quick revision",
            icon: "/flashcards.png",
            path: '/flashCard',
            type: 'flashCard'
        },
        {
            name: 'Quizzes',
            desc: "Quizzes for your testing your preparation",
            icon: "/quiz.jpg",
            path: '/quiz',
            type: 'quiz',
        },
        {
            name: 'Question/Answers',
            desc: "Question/Answers for your preparation",
            icon: "/qna.jpg",
            path: '/question',
            type: 'question',
        },
    ];

    useEffect(() => {
        GetStudyMaterial();
    }, []);

    const GetStudyMaterial = async () => {
        const result = await axios.post('/api/study-type', {
            courseId: courseId,
            studyType: 'ALL',
        });
        console.log(result.data);
        setStudyTypeContent(result.data);
    };

    return (
        <div className="mt-5">
            <h2 className="font-medium text-xl md:text-2xl mb-4">Your Study Material</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {MaterialList.map((item, index) => (
                    <MaterialCardItem
                        key={index}
                        item={item}
                        studyTypeContent={studyTypeContent}
                        course={course}
                        refreshData={GetStudyMaterial}
                    />
                ))}
            </div>

        </div>
    );
}

export default StudyMaterialSection;
