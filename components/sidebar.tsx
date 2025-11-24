'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, History, Library, Settings, Mic, AudioWaveform as Waveform, LogOut, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getUserAvatar, getInitials } from '@/lib/avatar-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'History', href: '/history', icon: History },
  { name: 'Templates Library', href: '/templates', icon: Library },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Debug', href: '/debug', icon: Bug },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className='flex h-screen w-64 flex-col border-r bg-white'>
      <div className='flex h-16 items-center border-b px-6'>
        <h1 className='text-2xl font-bold text-blue-600'>Assure Sense</h1>
      </div>

      <div className='flex-1 space-y-1 overflow-y-auto p-4'>
        <Button variant='default' className='mb-2 w-full justify-start gap-2' asChild>
          <Link href='/consultation/new'>
            <Waveform className='h-4 w-4' />
            New Consultation
          </Link>
        </Button>

        <Button variant='outline' className='mb-4 w-full justify-start gap-2 bg-transparent' asChild>
          <Link href='/dictation/new'>
            <Mic className='h-4 w-4' />
            New Dictation (coming soon)
          </Link>
        </Button>

        <nav className='space-y-1'>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className='h-5 w-5' />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className='border-t p-4'>
        {userEmail && (
          <div className='mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={getUserAvatar(userId, userEmail) || '/placeholder.svg'} alt={userEmail} />
              <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
            </Avatar>
            <div className='flex-1 overflow-hidden'>
              <p className='truncate text-sm font-medium text-gray-900'>{userEmail.split('@')[0]}</p>
              <p className='truncate text-xs text-gray-500'>{userEmail}</p>
            </div>
          </div>
        )}
        <Button variant='ghost' className='w-full justify-start gap-2 text-gray-700' onClick={handleSignOut}>
          <LogOut className='h-4 w-4' />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
