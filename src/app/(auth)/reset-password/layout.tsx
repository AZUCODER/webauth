import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | WebAuth",
  description: "Reset your password",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 