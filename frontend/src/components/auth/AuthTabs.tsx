"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Separator } from "@/components/ui/Separator";
import { GoogleButton } from "./GoogleButton";
import { EmailOTPForm } from "./EmailOTPForm";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";

export function AuthTabs({ onSuccess }: { onSuccess: () => void }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="w-full space-y-6">
      <Tabs value={tab} onValueChange={(v) => {
        setTab(v as any);
        setShowEmailForm(false);
      }} className="w-full">
        <TabsList className="grid grid-cols-2 bg-white/5 p-1 rounded-xl h-11 mb-6 border border-white/10">
          <TabsTrigger 
            value="signin" 
            className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-sm font-medium"
          >
            Sign in
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-sm font-medium"
          >
            Sign up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-4">
            <GoogleButton />
            
            {!showEmailForm ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#020617] px-2 text-gray-500 font-bold tracking-widest">OR</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full h-12 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-dashed border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Sign in with email
                </Button>
              </div>
            ) : (
              <EmailOTPForm isSignUp={false} onSuccess={onSuccess} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="signup" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-4">
            <GoogleButton />
            
            {!showEmailForm ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#020617] px-2 text-gray-500 font-bold tracking-widest">OR</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full h-12 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-dashed border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Sign up with email
                </Button>
              </div>
            ) : (
              <EmailOTPForm isSignUp={true} onSuccess={onSuccess} />
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-[10px] text-center text-gray-500 px-6 leading-relaxed">
        By continuing, you agree to TAJ AI's <span className="underline hover:text-gray-400 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-gray-400 cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );
}
