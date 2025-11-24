'use client'

import type React from 'react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-blue-600'>Assure Sense</h1>
          <p className='mt-2 text-muted-foreground'>AI-Powered Clinical Documentation</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Sign up</CardTitle>
            <CardDescription>Create your account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className='flex flex-col gap-6'>
                <div className='grid gap-2'>
                  <Label htmlFor='fullName'>Full Name</Label>
                  <Input id='fullName' type='text' placeholder='Dr. John Smith' required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' placeholder='doctor👩‍⚕️@example.com' required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input id='password' type='password' required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='repeat-password'>Repeat Password</Label>
                  <Input id='repeat-password' type='password' required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
                </div>
                {error && <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </Button>
              </div>
              <div className='mt-4 text-center text-sm'>
                Already have an account?{' '}
                <Link href='/auth/login' className='font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700'>
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
