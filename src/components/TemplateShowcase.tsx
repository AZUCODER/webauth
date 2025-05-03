import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Define template data
const templates = [
  {
    id: "nextjs",
    title: "Next.js Starter",
    description: "A Next.js App Router template configured with cookie-based auth using WebAuth, TypeScript and Tailwind CSS.",
    icons: ["nextjs", "tailwind"],
    url: "/templates/nextjs"
  },
  {
    id: "chatbot",
    title: "AI Chatbot",
    description: "An open-source AI chatbot app template built with Next.js, the Vercel AI SDK, OpenAI, and WebAuth.",
    icons: ["nextjs", "openai"],
    url: "/templates/chatbot"
  },
  {
    id: "langchain",
    title: "LangChain + Next.js Starter",
    description: "Starter template and example use-cases for LangChain projects in Next.js, including chat, agents, and retrieval.",
    icons: ["langchain", "nextjs"],
    url: "/templates/langchain"
  },
  {
    id: "flutter",
    title: "Flutter User Management",
    description: "Get started with WebAuth and Flutter by building a user management app with auth, file storage, and database.",
    icons: ["flutter"],
    url: "/templates/flutter"
  },
  {
    id: "react-native",
    title: "React Native Starter",
    description: "An extended version of create-t3-turbo implementing authentication on both the web and mobile applications.",
    icons: ["react-native"],
    url: "/templates/react-native"
  },
  {
    id: "stripe",
    title: "Stripe Subscriptions Starter",
    description: "The all-in-one subscription starter kit for high-performance SaaS applications, powered by Stripe, WebAuth, and Vercel.",
    icons: ["stripe", "nextjs"],
    url: "/templates/stripe"
  }
];

// Define template interface
interface Template {
  id: string;
  title: string;
  description: string;
  icons: string[];
  url: string;
}

// Helper component for template cards
function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="flex flex-col rounded-xl border bg-card/50 transition-all hover:shadow-md hover:bg-card">
      <div className="flex items-center gap-3 border-b p-5">
        {template.icons.map((icon) => (
          <div key={icon} className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {icon === "nextjs" && <span className="font-bold text-xl">N</span>}
            {icon === "tailwind" && <span className="font-bold text-xl">T</span>}
            {icon === "openai" && <span className="font-bold text-xl">AI</span>}
            {icon === "langchain" && <span className="font-bold text-xl">L</span>}
            {icon === "flutter" && <span className="font-bold text-xl">F</span>}
            {icon === "react-native" && <span className="font-bold text-xl">R</span>}
            {icon === "stripe" && <span className="font-bold text-xl">S</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col space-y-3 p-6">
        <h3 className="text-xl font-semibold">{template.title}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
      <div className="p-6 pt-0">
        <Link href={template.url}>
          <Button variant="ghost" className="group flex items-center gap-2 px-0 text-sm font-medium text-foreground">
            View Template
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function TemplateShowcase() {
  return (
    <section className="relative py-20 md:py-24 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] -right-[40%] h-[700px] w-[700px] rounded-full bg-blue-500/5 blur-3xl"></div>
        <div className="absolute -bottom-[10%] -left-[40%] h-[700px] w-[700px] rounded-full bg-emerald-500/5 blur-3xl"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Start building in seconds
          </h2>
          <p className="text-muted-foreground md:text-lg lg:text-xl">
            Kickstart your next project with templates built by us and our community.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/examples">
              <Button variant="outline" className="font-medium shadow-sm">
                View all examples
              </Button>
            </Link>
            <Link href="https://github.com/your-org/webauth">
              <Button variant="outline" className="flex items-center gap-2 font-medium shadow-sm">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.465.5.09.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
                Official GitHub library
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
} 