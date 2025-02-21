import { prisma } from "@/src/utils/db";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { jobId: string } }
) {
	try {
		const { jobId } = params;
		const { location } = await request.json();
		const today = new Date().toISOString().split('T')[0];
		
		const [jobPost, metrics] = await Promise.all([
			prisma.jobPost.update({
				where: { id: jobId },
				data: { clicks: { increment: 1 } }
			}),
			prisma.jobMetrics.findUnique({
				where: { jobPostId: jobId }
			})
		]);

		if (!metrics) {
			await prisma.jobMetrics.create({
				data: {
					jobPostId: jobId,
					totalClicks: 1,
					clicksByDate: { [today]: 1 },
					viewsByDate: {},
					locationData: location ? { [location]: 1 } : {}
				}
			});
		} else {
			const clicksByDate = { ...metrics.clicksByDate as any };
			clicksByDate[today] = (clicksByDate[today] || 0) + 1;

			const locationData = { ...metrics.locationData as any };
			if (location) {
				locationData[location] = (locationData[location] || 0) + 1;
			}

			await prisma.jobMetrics.update({
				where: { jobPostId: jobId },
				data: {
					totalClicks: { increment: 1 },
					clicksByDate,
					locationData
				}
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to track job click:', error);
		return NextResponse.json(
			{ error: 'Failed to track click' },
			{ status: 500 }
		);
	}
}