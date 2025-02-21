"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";

function VerificationLink({ id }: { id: string }) {
  if (!id) return null;
  
  return (
    <Link href={`/verification/${id}`}>
      <Button variant="default" className="bg-violet-600 hover:bg-violet-700">
        View Verification {id.slice(0, 8)}...
      </Button>
    </Link>
  );
}

export default function TestingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [verificationIds, setVerificationIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationIds = async () => {
      try {
        const response = await fetch('/api/verification/test-ids');
        if (!response.ok) {
          throw new Error('Failed to fetch verification IDs');
        }
        const data = await response.json();
        setVerificationIds(data.map((v: { id: string }) => v.id));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load verification IDs",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationIds();
  }, [toast]);

  const handleDirectNavigation = (id: string) => {
    if (!id) {
      toast({
        variant: "destructive",
        title: "Invalid ID",
        description: "Please provide a valid verification ID",
      });
      return;
    }
    router.push(`/verification/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 p-8 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-zinc-400">Loading verification IDs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-violet-400">
          Verification Navigation Testing
        </h1>

        {verificationIds.length === 0 ? (
          <div className="text-center p-8 border border-violet-500/20 rounded-lg">
            <p className="text-zinc-400">No verification IDs found</p>
          </div>
        ) : (
          <>
            {/* Test using Link component */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-300">
                Test Link Navigation
              </h2>
              <div className="grid gap-4">
                {verificationIds.map((id) => (
                  <VerificationLink key={id} id={id} />
                ))}
              </div>
            </div>

            {/* Test using programmatic navigation */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-300">
                Test Programmatic Navigation
              </h2>
              <div className="grid gap-4">
                {verificationIds.map((id) => (
                  <Button 
                    key={id}
                    onClick={() => handleDirectNavigation(id)}
                    variant="outline"
                    className="border-violet-500/20 hover:bg-violet-500/10"
                  >
                    Navigate to {id.slice(0, 8)}...
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Test error cases */}
        <div className="space-y-4 pt-8 border-t border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-300">
            Test Error Cases
          </h2>
          <div className="grid gap-4">
            <Button 
              onClick={() => handleDirectNavigation('undefined')}
              variant="destructive"
            >
              Test Undefined ID
            </Button>
            <Button 
              onClick={() => handleDirectNavigation('')}
              variant="destructive"
            >
              Test Empty ID
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}