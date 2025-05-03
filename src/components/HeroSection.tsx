import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoCarousel } from "@/components/LogoCarousel";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[40%] -right-[50%] h-[800px] w-[800px] rounded-full bg-indigo-600/10 blur-3xl"></div>
          <div className="absolute -bottom-[30%] -left-[30%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block">Build in a weekend</span>
                <span className="block bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">Scale to millions</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                WebAuth is an open source authentication and authorization solution.
                Start your project with secure authentication, instant APIs, and easy integration.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm font-medium text-white">
                  Start your project
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="shadow-sm font-medium">
                  Request a demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="relative grid gap-6 sm:grid-cols-2 lg:max-w-none">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold">Authentication</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Secure user sign-ups and logins with multiple auth providers.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold">Storage</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Store and serve large files with ease and security.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                        <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold">Functions</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Deploy code globally without managing servers.
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                        <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold">Realtime</h3>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Build dynamic experiences with live data updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Carousel */}
      <LogoCarousel />
    </section>
  );
} 