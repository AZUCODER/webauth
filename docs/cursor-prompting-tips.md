# Cursor Prompting Tips for Senior Web Developers

## General Best Practices

1. **Be Specific and Contextual**
   - Provide clear context about the current state of the application
   - Mention relevant files and components
   - Specify the exact behavior or outcome you want to achieve

2. **Use Technical Terminology**
   - Reference specific React hooks, patterns, or concepts
   - Mention exact Tailwind CSS classes or utilities
   - Reference specific shadcn/ui or Radix UI components

3. **Include Error Messages**
   - Share any error messages or warnings you're encountering
   - Provide stack traces when relevant
   - Mention the environment (development, production, etc.)

## React & Next.js Specific

1. **Component Architecture**
   - Specify if you need a client or server component
   - Mention any specific React patterns (HOC, Render Props, etc.)
   - Indicate if you need to use specific Next.js features (ISR, SSR, etc.)

2. **State Management**
   - Specify the state management approach (Context, Zustand, etc.)
   - Mention any specific performance considerations
   - Indicate if you need to handle server/client state synchronization

3. **Performance Optimization**
   - Mention if you need to optimize for specific metrics
   - Specify if you need to implement code splitting
   - Indicate if you need to handle caching strategies

## Tailwind CSS Tips

1. **Responsive Design**
   - Specify breakpoints and responsive behavior
   - Mention any specific mobile-first considerations
   - Indicate if you need to handle dark mode or other themes

2. **Customization**
   - Mention if you need to extend the Tailwind config
   - Specify any custom plugins or utilities needed
   - Indicate if you need to handle dynamic classes

## shadcn/ui & Radix UI

1. **Component Customization**
   - Specify which shadcn/ui components you're working with
   - Mention any specific styling or behavior modifications
   - Indicate if you need to handle accessibility features

2. **Theme Integration**
   - Specify if you need to modify the default theme
   - Mention any specific color schemes or design tokens
   - Indicate if you need to handle theme switching

## Advanced Topics

1. **Testing**
   - Specify the testing framework (Jest, React Testing Library, etc.)
   - Mention any specific test cases or scenarios
   - Indicate if you need to handle mocking or test utilities

2. **Deployment & CI/CD**
   - Mention the deployment platform (Vercel, Netlify, etc.)
   - Specify any build or deployment configurations
   - Indicate if you need to handle environment variables

3. **Security**
   - Mention any specific security concerns
   - Specify if you need to handle authentication or authorization
   - Indicate if you need to implement specific security measures

## Example Prompts

```markdown
"I need to create a responsive dashboard layout using Next.js 14, with a sidebar that collapses on mobile. The sidebar should use shadcn/ui's Sheet component for mobile view and maintain state using Zustand."

"I'm implementing a form with complex validation using React Hook Form and Zod. The form needs to handle file uploads and show real-time validation feedback using shadcn/ui's Form components."

"I need to optimize the performance of a large data table component. It should implement virtual scrolling using TanStack Table, with server-side pagination and sorting. The table should be responsive and use shadcn/ui's Table component."
```

## Common Pitfalls to Avoid

1. **Vague Requirements**
   - Don't: "Make the button look better"
   - Do: "Update the primary button component to use a gradient background on hover and add a subtle scale animation"

2. **Missing Context**
   - Don't: "Fix the error"
   - Do: "I'm getting a hydration error in the Header component when switching themes. The error occurs in development mode and here's the exact error message..."

3. **Unclear Scope**
   - Don't: "Implement authentication"
   - Do: "I need to implement NextAuth.js with Google OAuth in my Next.js 14 app. I already have the environment variables set up and need help with the configuration and protected routes setup."

Remember to always provide as much context as possible and be specific about your requirements, constraints, and desired outcomes. 