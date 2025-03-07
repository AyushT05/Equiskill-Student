import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import CourseList from './_components/CourseList'
import { auth } from "@clerk/nextjs/server";


async function Dashboard() {
  
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  return (
    <div>
     
       <WelcomeBanner/>
       <CourseList/>
       </div>
  )
}

export default Dashboard