'use client';

import { useTransition } from 'react';
import { trackJobClick } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface JobClickTrackerProps {
  jobId: string;
  children: React.ReactNode;
}

export function JobClickTracker({ jobId, children }: JobClickTrackerProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      // Track the click
      await trackJobClick(jobId);
      // Redirect to apply page
      router.push(`/job/${jobId}/apply`);
    });
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
}
