import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function CourseCardItem({ course }) {
  const title = course?.courseLayout?.course_name || course?.courseLayout?.topic || 'Untitled Course';
  const summary = course?.courseLayout?.course_summary || '';

  return (
    <div className='border rounded-xl shadow-sm p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white flex flex-col gap-3'>
      <div className='flex justify-between items-start'>
        <Image src={'/coursecard.png'} alt='course' width={52} height={52} className="rounded-lg" />
        <span className='text-[10px] px-2 py-1 rounded-full bg-primary text-white font-medium'>
          {course?.courseType}
        </span>
      </div>

      {/* FIX: display course title prominently */}
      <h2 className='font-semibold text-base text-gray-900 leading-snug line-clamp-2'>{title}</h2>
      <p className='text-sm text-gray-500 line-clamp-2 leading-relaxed'>{summary}</p>

      <div className='flex items-center justify-between mt-auto pt-2 border-t border-gray-100'>
        <span className='text-xs text-gray-400'>
          {course?.courseLayout?.chapters?.length ?? 0} chapters
        </span>
        {course?.status === 'Generating' ? (
          <span className='text-xs flex gap-1.5 items-center px-2 py-1 rounded-full bg-amber-100 text-amber-700'>
            <RefreshCw className='h-3.5 w-3.5 animate-spin' />
            Generating...
          </span>
        ) : (
          <Link href={'/course/' + course?.courseId}>
            <Button size="sm" className='transition-all hover:bg-primary/85'>View</Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default CourseCardItem
