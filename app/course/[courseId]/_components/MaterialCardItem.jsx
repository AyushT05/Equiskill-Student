import { Button } from '@/components/ui/button'
import axios from 'axios'
import { RefreshCcw } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // Import useRouter
import { toast } from 'sonner'

function MaterialCardItem({ item, studyTypeContent, course, refreshData }) {
  const [loading, setLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState(null) // Store API response data
  const router = useRouter() // Initialize useRouter
  

  const GenerateContent = async () => {
    toast("Generating your content!")
    setLoading(true)

    let chapters = '';
    course?.courseLayout.chapters.forEach((chapter) => {
      chapters = (chapter.chapter_title || chapter.chapterTitle) + ',' + chapters
    });

    try {
      const result = await axios.post('/api/study-type-content', {
        courseId: course?.courseId,
        type: item.name,
        chapters: chapters
      })

      console.log("Result:", result);
      setGeneratedData(result.data) // Store the returned data
      refreshData(true)
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setLoading(false)

    }
    toast("Your Content is ready!")
  }

  

  const isContentReady = generatedData !== null || studyTypeContent?.[item.type]?.length != null

  return (
    <div className={`flex flex-col gap-3 items-center p-5 border shadow-md rounded-lg w-full max-w-[250px] mx-auto
      ${!isContentReady ? 'grayscale' : ''}`}>
      
      <h2 className='p-1 px-2 bg-green-500 text-white rounded-full text-[10px] mb-2'>
        {isContentReady ? 'Ready' : 'Not Ready'}
      </h2>
      
      <Image src={item.icon} alt={item.name} width={50} height={50}/>
      <h2 className='font-bold text-lg text-center'>{item.name}</h2>
      <p className='text-gray-400 text-sm text-center'>{item.desc}</p>

      {isContentReady ? (
        <Button 
          className='mt-2 w-full bg-primary text-white' 
          variant='outline'
          onClick={() => router.push(`/course/${course?.courseId}${item.path}`)}
        >
          View
        </Button>
      ) : (
        <Button className='mt-2 w-full bg-primary text-white' variant='outline' onClick={GenerateContent} disabled={loading}>
          {loading && <RefreshCcw className='animate-spin' />} Generate
        </Button>
      )}
    </div>
  )
}

export default MaterialCardItem
