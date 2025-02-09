import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		const userId = searchParams.get('userId');
		const verificationId = searchParams.get('verificationId');

		console.log('JobSeeker Lookup - Params:', { id, userId, verificationId });

		let jobSeeker = null;

		if (id) {
			// Direct ID lookup
			jobSeeker = await prisma.jobSeeker.findUnique({
				where: { id },
				select: {
					id: true,
					name: true,
					about: true,
					skills: true,
					experience: true,
					yearsOfExperience: true,
					linkedin: true,
					github: true,
					portfolio: true,
					applications: true,
				},
			});
		} else if (userId) {
			// User ID lookup
			jobSeeker = await prisma.jobSeeker.findUnique({
				where: { userId },
				select: {
					id: true,
					name: true,
					about: true,
					skills: true,
					experience: true,
					yearsOfExperience: true,
					linkedin: true,
					github: true,
					portfolio: true,
					applications: true,
				},
			});
		} else if (verificationId) {
			// Get most recent jobseeker
			jobSeeker = await prisma.jobSeeker.findFirst({
				orderBy: {
					createdAt: 'desc'
				},
				select: {
					id: true,
					name: true,
					about: true,
					skills: true,
					experience: true,
					yearsOfExperience: true,
					linkedin: true,
					github: true,
					portfolio: true,
					applications: true,
				},
			});
		}

		console.log('JobSeeker Lookup - Found:', jobSeeker);

		if (!jobSeeker) {
			console.log('JobSeeker Lookup - Not found');
			return NextResponse.json(
				{ error: "Job seeker not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(jobSeeker);
	} catch (error) {
		console.error("Error looking up job seeker:", error);
		return NextResponse.json(
			{ error: "Failed to lookup job seeker" },
			{ status: 500 }
		);
	}
}