"use client";

import { useEffect, useState } from "react";

interface ContentDisplayProps {
  content: string;
  className?: string;
}

export default function ContentDisplay({
  content,
  className,
}: ContentDisplayProps) {
  const [sanitizedContent, setSanitizedContent] = useState(content);
  
  useEffect(() => {
    // Import DOMPurify only on the client side
    import("isomorphic-dompurify").then((DOMPurifyModule) => {
      const DOMPurify = DOMPurifyModule.default;
      const sanitized = DOMPurify.sanitize(content, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["target", "frameborder", "allowfullscreen"],
      });
      setSanitizedContent(sanitized);
    });
  }, [content]);

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
