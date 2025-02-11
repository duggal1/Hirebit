import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';

export async function GET(
	request: Request,
	context: { params: { id: string } }
) {
	try {
		const { id } = context.params;
		
		if (!id) {
			return NextResponse.json(
				{ error: 'JobSeeker ID is required' },
				{ status: 400 }
			);
		}

		const jobSeeker = await prisma.jobSeeker.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				skills: true,
				experience: true,
				location: true
			}
		});

		if (!jobSeeker) {
			return NextResponse.json(
				{ error: "JobSeeker not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(jobSeeker);
	} catch (error) {
		console.error('GET JobSeeker - Error:', error);
		return NextResponse.json(
			{ error: "Failed to fetch job seeker" },
			{ status: 500 }
		);
	}
}