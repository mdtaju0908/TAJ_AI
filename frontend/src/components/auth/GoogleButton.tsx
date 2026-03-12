"use client";

import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "./GoogleIcon";
import { useAuth } from "@/hooks/useAuth";

export function GoogleButton() {
  const { signInWithGoogle } = useAuth();

  return (
    <Button
      variant="secondary"
      className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
      onClick={signInWithGoogle}
    >
      <GoogleIcon className="w-5 h-5" />
      <span className="font-medium">Continue with Google</span>
    </Button>
  );
}
