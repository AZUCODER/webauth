import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verification | WebAuth",
  description: "Verify your email address to complete your account setup",
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 