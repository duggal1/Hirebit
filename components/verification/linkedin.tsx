"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, MapPin, Activity, User } from "lucide-react";
import { LinkedInProfile } from "@/src/types/linkedin";

interface LinkedInResultsProps {
  data: LinkedInProfile;
}  

export function LinkedInResults({ data }: LinkedInResultsProps) {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
      <motion.div {...fadeIn}>
        <Card className="bg-black/40 backdrop-blur-xl border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              LinkedIn Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Verification Status */}
            <div className="flex items-center gap-3">
              {data.validationDetails.isValid ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-zinc-200">
                      {data.validationDetails.profileExists ? 
                        "LinkedIn Profile Verified Successfully ✨" : 
                        "Valid URL but suspicious profile name"}
                    </span>
                    <span className="text-zinc-400 text-sm">
                      {data.validationDetails.message}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div className="flex flex-col">
                    <span className="text-zinc-200">Invalid LinkedIn URL</span>
                    <span className="text-zinc-400 text-sm">
                      URL must follow the format: linkedin.com/in/username
                    </span>
                  </div>
                </>
              )}
            </div>
  
            {/* URL Format Guide - Only show when validation fails */}
            {!data.validationDetails.isValid && (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-blue-400 text-sm">
                  <span className="font-semibold">Valid URL examples:</span>
                  <br />
                  ✓ https://www.linkedin.com/in/john-doe
                  <br />
                  ✓ https://linkedin.com/in/jane-smith-123
                  <br />
                  ✓ https://www.linkedin.com/in/alexturner
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
}