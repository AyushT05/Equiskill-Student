"use client"
import { useUser } from '@clerk/nextjs'
import { UserProfile } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-1" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="mb-8 flex items-center gap-4">
        {user?.imageUrl && (
          <img
            src={user.imageUrl}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
          <p className="text-gray-500 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <UserProfile
          appearance={{
            elements: {
              rootBox: { width: '100%' },
              card: { boxShadow: 'none', border: 'none', borderRadius: '0' },
            },
          }}
        />
      </div>
    </div>
  )
}

export default ProfilePage
