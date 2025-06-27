"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Database,
  Lock,
  HardDrive,
  Code,
  Activity,
  Sparkles,
  Clock,
  Boxes,
  FileText,
  Puzzle,
  Layers,
  History,
  LifeBuoy,
  Github,
  Users,
  Calendar,
} from "lucide-react";

interface NavItemProps {
  name: string;
  href?: string;
  children?: React.ReactNode;
}

const productModules = [
  {
    icon: <Database className="h-5 w-5 text-emerald-500" />,
    title: "Database",
    description: "Fully portable Postgres database",
    href: "/database",
  },
  {
    icon: <Lock className="h-5 w-5 text-blue-500" />,
    title: "Authentication",
    description: "User Management out of the box",
    href: "/auth",
  },
  {
    icon: <HardDrive className="h-5 w-5 text-purple-500" />,
    title: "Storage",
    description: "Serverless storage for any media",
    href: "/storage",
  },
  {
    icon: <Code className="h-5 w-5 text-amber-500" />,
    title: "Edge Functions",
    description: "Deploy code globally on the edge",
    href: "/functions",
  },
  {
    icon: <Activity className="h-5 w-5 text-pink-500" />,
    title: "Realtime",
    description: "Synchronize and broadcast events",
    href: "/realtime",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-blue-400" />,
    title: "Vector",
    description: "AI toolkit to manage embeddings",
    href: "/vector",
  },
  {
    icon: <Clock className="h-5 w-5 text-green-400" />,
    title: "Cron",
    description: "Schedule and manage recurring Jobs",
    href: "/cron",
  },
  {
    icon: <Boxes className="h-5 w-5 text-yellow-500" />,
    title: "Queues",
    description: "Durable Message Queues with guaranteed delivery",
    href: "/queues",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-purple-400" />,
    title: "Features",
    description: "Explore everything you can do with WebAuth",
    href: "/features",
  }
];

const developersItems = [
  {
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    title: "Documentation",
    href: "/docs"
  },
  {
    icon: <Puzzle className="h-5 w-5 text-green-500" />,
    title: "Integrations",
    href: "/integrations"
  },
  {
    icon: <Layers className="h-5 w-5 text-purple-500" />,
    title: "WebAuth UI",
    href: "/ui"
  },
  {
    icon: <History className="h-5 w-5 text-amber-500" />,
    title: "Changelog",
    href: "/changelog"
  },
  {
    icon: <LifeBuoy className="h-5 w-5 text-pink-500" />,
    title: "Support",
    href: "/support"
  },
];

const resourcesItems = [
  {
    icon: <Code className="h-5 w-5 text-emerald-500" />,
    title: "Open Source",
    href: "/open-source"
  },
  {
    icon: <Github className="h-5 w-5 text-foreground" />,
    title: "GitHub Discussions",
    href: "https://github.com/your-org/webauth/discussions"
  },
  {
    icon: <Users className="h-5 w-5 text-blue-400" />,
    title: "Become a Partner",
    href: "/partners"
  },
  {
    icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
    title: "Careers",
    href: "/careers"
  },
  {
    icon: <Calendar className="h-5 w-5 text-purple-400" />,
    title: "Events & Webinars",
    href: "/events"
  },
];

const blogItems = [
  {
    title: "Top 10 Launches of Launch Week 14",
    description: "Highlights from Launch Week 14",
    href: "/blog/launch-week-14"
  },
  {
    title: "Migrating from Fauna to WebAuth",
    description: "A guide to migrating from Fauna to WebAuth.",
    href: "/blog/fauna-migration"
  }
];

const customerStories = [
  {
    logo: "/company-logos/example-logo.svg",
    title: "Company used WebAuth to unlock faster growth",
    href: "/customers/example",
  }
];

const comparisons = [
  { title: "WebAuth vs Firebase", href: "/compare/firebase" },
  { title: "WebAuth vs Heroku Postgres", href: "/compare/heroku" },
  { title: "WebAuth vs Auth0", href: "/compare/auth0" },
];

const solutions = [
  { title: "AI Builders", href: "/solutions/ai" },
];

function NavItem({ name, href, children }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navItemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  if (!children) {
    return (
      <Link
        href={href || "#"}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:opacity-80"
      >
        {name}
      </Link>
    );
  }

  return (
    <div 
      className="relative" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      ref={navItemRef}
    >
      <button
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:opacity-80"
      >
        {name}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="fixed z-50 w-[900px] rounded-md border border-border bg-background/98 shadow-lg ring-1 ring-border/5 backdrop-blur supports-[backdrop-filter]:bg-background/90" 
             style={{ 
               top: "calc(var(--navbar-height) + 2px)",
               left: "50%", 
               transform: "translateX(-50%)"
             }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Set CSS variable for navbar height
  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', '64px');
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="Symtext Logo"
                width={24}
                height={24}
                className="rounded-full dark:invert"
              />
              <span className="hidden sm:inline-block">
                Algoriware
              </span>
            </Link>

            <div className="hidden md:flex md:gap-8">
              <NavItem name="Product">
                <div className="flex">
                  {/* Main modules column - 2/3 width */}
                  <div className="w-2/3 border-r p-6">
                    <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      MODULES
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {productModules.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-start rounded-md p-2 transition-colors hover:bg-muted/80"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                            {item.icon}
                          </div>
                          <div className="max-w-[180px]">
                            <div className="text-sm font-medium">
                              {item.title}
                            </div>
                            <div className="line-clamp-1 text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Comparison & Solutions column - 1/3 width */}
                  <div className="w-1/3 p-6 space-y-8">
                    {/* Customer Stories */}
                    <div className="mb-8">
                      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        CUSTOMER STORIES
                      </h3>
                      {customerStories.map((story) => (
                        <Link
                          key={story.title}
                          href={story.href}
                          className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/80"
                        >
                          <div className="h-8 w-8 bg-muted/50 rounded-md"></div>
                          <span className="text-sm">{story.title}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Compare section */}
                    <div className="mb-8">
                      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        COMPARE WEBAUTH
                      </h3>
                      <div className="space-y-1">
                        {comparisons.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="block rounded-md p-2 text-sm transition-colors hover:bg-muted/80"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Solutions section */}
                    <div>
                      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        SOLUTIONS
                      </h3>
                      <div className="space-y-1">
                        {solutions.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="block rounded-md p-2 text-sm transition-colors hover:bg-muted/80"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </NavItem>

              <NavItem name="Developers">
                <div className="flex">
                  {/* Developers and Resources column */}
                  <div className="w-1/2 border-r p-6">
                    <div className="flex">
                      {/* Developers section - left side */}
                      <div className="w-1/2 pr-4">
                        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          DEVELOPERS
                        </h3>
                        <div className="space-y-2">
                          {developersItems.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              className="flex items-center rounded-md p-2 transition-colors hover:bg-muted/80"
                            >
                              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                                {item.icon}
                              </div>
                              <span className="text-sm font-medium">
                                {item.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Resources section - right side */}
                      <div className="w-1/2 pl-4">
                        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          RESOURCES
                        </h3>
                        <div className="space-y-2">
                          {resourcesItems.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              className="flex items-center rounded-md p-2 transition-colors hover:bg-muted/80"
                            >
                              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                                {item.icon}
                              </div>
                              <span className="text-sm font-medium">
                                {item.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blog column */}
                  <div className="w-1/2 p-6">
                    <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      BLOG
                    </h3>
                    <div className="space-y-3">
                      {blogItems.map((post) => (
                        <Link
                          key={post.title}
                          href={post.href}
                          className="block rounded-md p-2 transition-colors hover:bg-muted/80"
                        >
                          <div className="font-medium text-sm">
                            {post.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {post.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </NavItem>

              <NavItem name="Enterprise" href="/enterprise" />
              <NavItem name="Pricing" href="/pricing" />
              <NavItem name="Docs" href="/docs" />
              <NavItem name="Blog" href="/blog" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <div className="hidden md:flex md:items-center md:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 font-medium text-white"
                >
                  Start your project
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-16 z-50 max-h-[80vh] overflow-y-auto border-x border-b bg-background p-4 shadow-lg md:hidden">
          <div className="flex flex-col space-y-4 py-2">
            <div className="border-b pb-4">
              <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                MODULES
              </p>
              {productModules.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="border-b pb-4">
              <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                DEVELOPERS
              </p>
              {developersItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              ))}
            </div>

            <div className="border-b pb-4">
              <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                RESOURCES
              </p>
              {resourcesItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              ))}
            </div>

            <div className="border-b pb-4">
              <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                COMPARE WEBAUTH
              </p>
              {comparisons.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <Link
              href="/enterprise"
              className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Enterprise
            </Link>

            <Link
              href="/pricing"
              className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>

            <Link
              href="/docs"
              className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>

            <Link
              href="/blog"
              className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>

            <div className="flex flex-col gap-2 pt-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Start your project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 