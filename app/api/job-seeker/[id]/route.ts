import { NextRequest } from 'next/server';
import { prisma } from '@/app/utils/db';

export async function GET(
	request: NextRequest,
	context: { params: { id: string } }
) {
	try {
		const id = (await context.params).id;

		// Validate UUID format
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(id)) {
			return new Response(
				JSON.stringify({ error: 'Invalid JobSeeker ID format' }),
				{ status: 400 }
			);
		}

		const jobSeeker = await prisma.jobSeeker.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				github: true,
				linkedin: true,
				portfolio: true,
				Verification: {
					include: {
						company: true
					}
				}
			}
		});

		if (!jobSeeker) {
			return new Response(
				JSON.stringify({ error: 'JobSeeker not found. Please check the ID and try again.' }),
				{ status: 404 }
			);
		}

		return new Response(JSON.stringify(jobSeeker));
	} catch (error) {
		console.error('GET JobSeeker - Error:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch JobSeeker data' }),
			{ status: 500 }
		);
	}
}