import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Xplore Nexus",
  description: "Sign in to Xplore Nexus — the unified events, meetings & training platform by Xplore Philippines.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
