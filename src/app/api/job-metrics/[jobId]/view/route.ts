import { prisma } from "@/src/utils/db";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { jobId: string } }
) {
	try {
		const { jobId } = params;
		const today = new Date().toISOString().split('T')[0];
		
		const [jobPost, metrics] = await Promise.all([
			prisma.jobPost.update({
				where: { id: jobId },
				data: { views: { increment: 1 } }
			}),
			prisma.jobMetrics.findUnique({
				where: { jobPostId: jobId }
			})
		]);

		if (!metrics) {
			await prisma.jobMetrics.create({
				data: {
					jobPostId: jobId,
					totalViews: 1,
					viewsByDate: { [today]: 1 },
					clicksByDate: {},
					locationData: {}
				}
			});
		} else {
			const viewsByDate = { ...metrics.viewsByDate as any };
			viewsByDate[today] = (viewsByDate[today] || 0) + 1;

			await prisma.jobMetrics.update({
				where: { jobPostId: jobId },
				data: {
					totalViews: { increment: 1 },
					viewsByDate
				}
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to track job view:', error);
		return NextResponse.json(
			{ error: 'Failed to track view' },
			{ status: 500 }
		);
	}
}