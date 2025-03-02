import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function CourseCardItem({course}) {
  return (
    <div className='border rounded-lg shadow-md p-5 transition-all transform hover:scale-105 hover:shadow-xl'>
      <div> 
        <div className='flex justify-between items-center mt-3' > 
            <Image src={'/coursecard.png'} alt='others' width={70} height={70} />
            <h2 className='text-[10px] p-1 px-2 rounded-full bg-primary text-white'>{course?.courseType}</h2>
        </div>
        <h2 className='mt-3 font-medium text-lg'>{course?.courseLayout.course_name}</h2>
        <p className='text-sm line-clamp-2 text-gray-500 mt-2'> {course?.courseLayout.course_summary}</p>
      
        

        <div className='mt-3 flex justify-end'> 
          {course?.status === 'Generating' ? (
            <h2 className='text-sm flex gap-2 items-center p-1 px-2 rounded-full bg-primary text-white'>
              <RefreshCw className='h-5 w-5 animate-spin'/>
              Generating...
            </h2>
          ) : (
            <Link href={'/course/'+course?.courseId}>
              <Button className='transition-all hover:bg-primary/80'>View</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCardItem
