'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { resendVerificationEmail } from '@/actions/auth/verifyActions'
import { Button } from '@/components/ui/button'

export default function VerificationPendingPage() {
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  
  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    setIsResending(true)
    
    try {
      const result = await resendVerificationEmail(email)
      
      if (result.success) {
        toast.success(result.message || 'Verification email sent!')
        setEmail('')
      } else {
        toast.error(result.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Error resending verification:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsResending(false)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold  text-gray-900">Welcome to Symtext</h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            We have sent a verification link to your email address. Please check your inbox and follow the link to verify your account.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="border-l-4 border-indigo-500 bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-indigo-700">
                    The verification link will expire in 24 hours.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Email not received?</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                <li>Check your spam or junk folder</li>
                <li>Verify you entered the correct email address</li>
                <li>Try resending the verification email</li>
              </ul>
              
              <form onSubmit={handleResendEmail} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isResending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            href="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to login page
          </Link>
        </div>
      </div>
    </div>
  )
} 