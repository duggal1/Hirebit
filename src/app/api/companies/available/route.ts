import { NextResponse } from 'next/server';
import { prisma } from '@/src/utils/db';

export async function GET() {
	try {
		// Get companies that have active job posts
		const companies = await prisma.company.findMany({
			where: {
				JobPost: {
					some: {
						status: 'ACTIVE'
					}
				}
			},
			select: {
				id: true,
				name: true,
				JobPost: {
					where: {
						status: 'ACTIVE'
					},
					select: {
						id: true
					}
				}
			}
		});

		// Transform the data to include activeJobs count
		const formattedCompanies = companies.map(company => ({
			id: company.id,
			name: company.name,
			activeJobs: company.JobPost.length
		}));

		return NextResponse.json(formattedCompanies);
	} catch (error) {
		console.error('GET Available Companies - Error:', error);
		return NextResponse.json(
			{ error: "Failed to fetch available companies" },
			{ status: 500 }
		);
	}
}