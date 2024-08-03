"use client";

import AuthButton from "@/components/AuthButton";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SessionProvider>
        <AuthButton />
      </SessionProvider>
    </main>
  );
}
