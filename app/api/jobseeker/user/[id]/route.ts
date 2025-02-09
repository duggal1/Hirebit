import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		console.log('GET JobSeeker by User ID:', id);

		const jobSeeker = await prisma.jobSeeker.findUnique({
			where: { userId: id },
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

		console.log('GET JobSeeker - Found:', jobSeeker);

		if (!jobSeeker) {
			console.log('GET JobSeeker - Not found');
			return NextResponse.json(
				{ error: "Job seeker not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(jobSeeker);
	} catch (error) {
		console.error("Error fetching job seeker:", error);
		return NextResponse.json(
			{ error: "Failed to fetch job seeker" },
			{ status: 500 }
		);
	}
}