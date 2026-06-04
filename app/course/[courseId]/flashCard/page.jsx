"use client"
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import FlashcardItem from './_components/FlashcardItem'

function FlashCards() {
    const { courseId } = useParams()
    const router = useRouter()
    const [flashcards, setFlashcards] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [stepCount, setStepCount] = useState(0)
    const [flipped, setFlipped] = useState(false)

    useEffect(() => {
        getFlashcards()
    }, [])

    const getFlashcards = async () => {
        setIsLoading(true)
        try {
            const result = await axios.post('/api/study-type', {
                courseId,
                studyType: 'Flashcard'
            })
            const content = result.data?.content
            setFlashcards(Array.isArray(content) ? content : [])
        } catch (err) {
            console.error('Error fetching flashcards:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const goNext = () => { setStepCount(s => s + 1); setFlipped(false) }
    const goPrev = () => { setStepCount(s => s - 1); setFlipped(false) }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading flashcards...</p>
                </div>
            </div>
        )
    }

    if (!flashcards.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-gray-500">No flashcards found for this course.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        )
    }

    const current = flashcards[stepCount]

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6 text-gray-500 hover:text-gray-800" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
            </Button>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Flashcards</h1>
            <p className="text-center text-gray-400 text-sm mb-6">{stepCount + 1} / {flashcards.length}</p>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
                {flashcards.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setStepCount(idx); setFlipped(false) }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === stepCount ? 'bg-primary scale-125' : 'bg-gray-300'}`}
                    />
                ))}
            </div>

            {/* Card */}
            <FlashcardItem flashcard={current} flipped={flipped} setFlipped={setFlipped} />

            <p className="text-center text-gray-400 text-xs mt-4">Click the card to flip it</p>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goPrev} disabled={stepCount === 0}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button onClick={goNext} disabled={stepCount === flashcards.length - 1}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}

export default FlashCards
