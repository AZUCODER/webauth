# Theme Switcher Implementation Plan

## Overview
This document outlines the plan for adding a theme switcher (dark, light, and system preference) to the project. The implementation will use the already installed `next-themes` package and will integrate with the existing UI components.

## Implementation Steps

### 1. Create Theme Provider Component
- Create a `ThemeProvider` component that wraps the application
- Configure it to support light, dark, and system themes
- Ensure proper hydration to avoid flashing during page load

### 2. Update Root Layout
- Add the `ThemeProvider` to the root layout to enable theme switching across the entire application
- Ensure proper configuration with HTML attributes

### 3. Create Theme Switcher Component
- Create a reusable `ThemeSwitcher` component
- Implement a dropdown menu with options for light, dark, and system themes
- Add appropriate icons for each theme option
- Ensure the component shows the currently active theme

### 4. Add Theme Switcher to Navigation
- Add the theme switcher component to the main navigation UI
- Position it appropriately in the layout
- Ensure it's accessible and mobile-responsive

### 5. Add CSS Variables for Theming
- Update the CSS to use theme-aware variables
- Ensure all UI components respect these variables
- Add smooth transitions between themes

## Technical Specifications

### Theme Provider Implementation
```tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

### Theme Switcher Component
```tsx
"use client"

import { useTheme } from "next-themes"
import { SunIcon, MoonIcon, ComputerIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <ComputerIcon className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Root Layout Update
```tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Files to Create or Modify

1. `src/components/theme-provider.tsx` - New file for the ThemeProvider component
2. `src/components/theme-switcher.tsx` - New file for the ThemeSwitcher component
3. `src/app/(client)/layout.tsx` - Update to include the ThemeProvider
4. Navigation component - Update to include the ThemeSwitcher

## Expected Behavior
- The theme switcher should allow users to select between light, dark, and system themes
- The selected theme should persist across page refreshes (stored in localStorage)
- The theme should default to the user's system preference on first visit
- The UI should update instantly when the theme changes
- The theme should be applied consistently across all components

## Future Enhancements
- Add custom themes beyond just light and dark
- Allow individual components to have theme overrides
- Add animations during theme transitions

## Dependencies
- `next-themes` (already installed)
- Existing UI components (Button, DropdownMenu, etc.)
- Icons from lucide-react 