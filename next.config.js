module.exports = {
  async redirects() {
    return [
      {
        source: '/register/verification-pending',
        destination: '/verify-email/pending',
        permanent: true,
      },
      {
        source: '/resend-verification',
        destination: '/verify-email/resend',
        permanent: true,
      },
      {
        source: '/forgot-password',
        destination: '/reset-password/request',
        permanent: true,
      }
    ]
  },
} 