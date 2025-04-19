'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmail } from '@/actions/auth/verifyActions'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Component to handle token retrieval with useSearchParams
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(3)
  
  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please try again or request a new verification email.')
      return
    }
    
    let timerRef: NodeJS.Timeout | undefined;
    
    const verify = async () => {
      try {
        const result = await verifyEmail(token)
        
        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Email verified successfully!')
          
          // Start countdown for redirect
          timerRef = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef)
                router.push('/login')
                return 0
              }
              return prev - 1
            })
          }, 1000)
          
        } else {
          setStatus('error')
          setMessage(result.error || 'Verification failed. Please try again.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }
    
    verify();
    
    // Return cleanup function
    return () => {
      if (timerRef) clearInterval(timerRef);
    };
  }, [token, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="relative h-36 bg-indigo-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Email Verification</h1>
          </div>
          <div className="absolute -bottom-12 inset-x-0 flex justify-center">
            {status === 'loading' && (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                <div className="animate-spin h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-green-100 shadow-md flex items-center justify-center">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-red-100 shadow-md flex items-center justify-center">
                <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 pt-16 pb-8">
          <div className="text-center mt-4">
            {status === 'loading' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900">Verifying your email</h2>
                <p className="mt-2 text-base text-gray-600">This will only take a moment...</p>
              </>
            )}
            
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-gray-900">Verification Successful!</h2>
                <p className="mt-2 text-base text-gray-600">{message}</p>
                <div className="mt-4 text-sm bg-blue-50 rounded-lg p-3 text-blue-800">
                  <p>Redirecting to login page in <span className="font-bold">{countdown}</span> seconds...</p>
                </div>
                <Link 
                  href="/login"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Go to login now &rarr;
                </Link>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
                <p className="mt-2 text-base text-gray-600">{message}</p>
                
                <div className="mt-6 space-y-3">
                  <Link 
                    href="/verify-email/resend"
                    className="inline-flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Get new verification link
                  </Link>
                  
                  <Link 
                    href="/login"
                    className="inline-flex w-full justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Return to login
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Loading fallback for Suspense
function VerificationSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="relative h-36 bg-indigo-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-48 bg-indigo-500 rounded animate-pulse"></div>
          </div>
          <div className="absolute -bottom-12 inset-x-0 flex justify-center">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
              <div className="animate-spin h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
        
        <div className="px-6 pt-16 pb-8">
          <div className="text-center mt-4">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerificationSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  )
} 