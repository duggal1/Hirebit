'use client';

import { useEffect } from 'react';

export function JobViewTracker({ jobId }: { jobId: string }) {
	useEffect(() => {
		const trackView = async () => {
			try {
				await fetch(`/api/job-metrics/${jobId}/view`, { method: 'POST' });
			} catch (error) {
				console.error('Failed to track job view:', error);
			}
		};
		trackView();
	}, [jobId]);

	return null;
}

export function JobClickTracker({ 
	jobId, 
	location,
	children 
}: { 
	jobId: string;
	location: string;
	children: React.ReactNode;
}) {
	const handleClick = async () => {
		try {
			await fetch(`/api/job-metrics/${jobId}/click`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ location })
			});
		} catch (error) {
			console.error('Failed to track job click:', error);
		}
	};

	return (
		<div onClick={handleClick}>
			{children}
		</div>
	);
}