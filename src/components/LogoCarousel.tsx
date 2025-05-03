"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Company logos for the carousel
const companyLogos = [
  { name: "Alibaba Cloud", src: "/company-logos/alibaba-cloud.svg" },
  { name: "AWS", src: "/company-logos/aws.svg" },
  { name: "Google Cloud", src: "/company-logos/google-cloud.svg" },
  { name: "PayPal", src: "/company-logos/paypal.svg" },
  { name: "Stripe", src: "/company-logos/stripe.svg" },
  { name: "Nextjs", src: "/company-logos/nextjs.svg" },
  { name: "Postgres", src: "/company-logos/postgresql.svg" },
];

export function LogoCarousel() {
  const [width, setWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Calculate animation duration based on the number of logos
  const animationDuration = companyLogos.length * 5; // 5 seconds per logo

  useEffect(() => {
    if (carouselRef.current && !isInitialized) {
      const initializeCarousel = () => {
        // Get all original logos
        const originalChildren = Array.from(carouselRef.current!.children);
        
        // Clone them to ensure seamless looping
        originalChildren.forEach(child => {
          const clone = child.cloneNode(true);
          carouselRef.current?.appendChild(clone);
        });
        
        // Calculate the width for animation
        if (originalChildren.length > 0) {
          const logoWidth = originalChildren[0].clientWidth;
          const gapWidth = 48; // equivalent to space-x-12 (3rem = 48px)
          const totalWidth = originalChildren.length * (logoWidth + gapWidth);
          setWidth(totalWidth);
          setIsInitialized(true);
        }
      };
      
      // Initialize after a small delay to ensure DOM is ready
      setTimeout(initializeCarousel, 100);
    }
  }, [isInitialized]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 md:mt-20">
      <p className="mb-6 text-center text-base font-medium text-muted-foreground">
        Trusted by fast-growing companies worldwide
      </p>
      
      {/* Carousel container with mask for fade effect */}
      <div 
        className="relative w-full overflow-hidden"
        style={{ 
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        {/* Animation wrapper */}
        <div 
          className="inline-flex space-x-12 py-4"
          ref={carouselRef}
          style={{
            animation: `carousel ${animationDuration}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {/* Original logos that will be duplicated via JS */}
          {companyLogos.map((logo, i) => (
            <div
              key={`logo-${i}`}
              className="h-12 w-32 flex-shrink-0 flex items-center justify-center opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              <Image 
                src={logo.src} 
                alt={logo.name} 
                width={120} 
                height={40} 
                className="w-auto h-8 object-contain"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const div = document.createElement('div');
                    div.className = 'text-sm font-medium text-muted-foreground';
                    div.innerText = logo.name;
                    parent.appendChild(div);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add CSS animation keyframes */}
      <style jsx global>{`
        @keyframes carousel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(${width > 0 ? `-${width}px` : '-100%'});
          }
        }
        
        /* Pause animation on hover */
        .inline-flex:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
} 