import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductFeatures() {
  return (
    <section className="relative bg-muted/30 py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Authentication & Authorization Made Simple
          </h2>
          <p className="text-muted-foreground md:text-lg lg:text-xl">
            Everything you need to build secure, modern web applications with Next.js
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {/* Feature 1 */}
          <div className="group rounded-xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md hover:bg-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold">Multi-provider Auth</h3>
            <p className="mb-4 text-muted-foreground">
              Support for email/password, social providers (Google, GitHub, etc.), and passwordless authentication.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Email & password</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>OAuth providers</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Magic link sign-in</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md hover:bg-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold">Row Level Security</h3>
            <p className="mb-4 text-muted-foreground">
              Secure your data with fine-grained access control policies directly at the database level.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>User-based access control</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Role-based permissions</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Policy enforcement</span>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md hover:bg-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
              <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold">Developer Experience</h3>
            <p className="mb-4 text-muted-foreground">
              Built for developers with simple APIs, comprehensive docs, and minimal setup.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Clean TypeScript APIs</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>React hooks & components</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Next.js app & pages router</span>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="group rounded-xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md hover:bg-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
              <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold">User Management</h3>
            <p className="mb-4 text-muted-foreground">
              Complete solution for managing users, roles, profiles, and sessions.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>User profiles & metadata</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Session management</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Role & permission management</span>
              </div>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="group rounded-xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md hover:bg-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/10">
              <svg className="h-7 w-7 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold">Enterprise Ready</h3>
            <p className="mb-4 text-muted-foreground">
              Features designed for enterprise-grade security and compliance requirements.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SAML & OIDC support</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>MFA & security policies</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Audit logs & compliance reporting</span>
              </div>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="group rounded-xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md hover:bg-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/10">
              <svg className="h-7 w-7 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold">Database Integration</h3>
            <p className="mb-4 text-muted-foreground">
              Seamless integration with your database of choice for user data storage.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>PostgreSQL support</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Database migrations</span>
              </div>
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Schema auto-generation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/docs">
            <Button size="lg" variant="outline" className="shadow-sm font-medium">
              Explore documentation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 