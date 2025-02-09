import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/db';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const verificationId = searchParams.get('verificationId');
		
		console.log('GET Company - Verification ID:', verificationId);

		if (!verificationId) {
			return NextResponse.json(
				{ error: 'Verification ID is required' },
				{ status: 400 }
			);
		}

		// First try to find existing verification with company
		const verification = await prisma.verification.findUnique({
			where: { id: verificationId },
			include: {
				company: {
					include: {
						JobPost: {
							where: {
								status: 'ACTIVE'
							}
						}
					}
				}
			}
		});

		console.log('GET Company - Initial verification:', verification);

		// If no company is associated, try to find and assign one
		if (!verification?.company) {
			console.log('GET Company - No company found, trying to assign one');
			
			// Find a company with active job posts
			const company = await prisma.company.findFirst({
				where: {
					AND: [
						{
							JobPost: {
								some: {
									status: 'ACTIVE'
								}
							}
						},
						{
							verifications: {
								none: {}
							}
						}
					]
				},
				include: {
					JobPost: {
						where: {
							status: 'ACTIVE'
						}
					}
				}
			});

			if (company && company.JobPost.length > 0) {
				console.log('GET Company - Found company with active jobs:', company);
				
				// Update verification with company
				const updatedVerification = await prisma.verification.update({
					where: { id: verificationId },
					data: {
						companyId: company.id,
						status: 'completed'
					},
					include: {
						company: true
					}
				});

				console.log('GET Company - Updated verification:', updatedVerification);
				return NextResponse.json({ 
					id: company.id,
					name: company.name,
					activeJobs: company.JobPost.length
				});
			}
		} else if (verification.company.JobPost.length > 0) {
			return NextResponse.json({ 
				id: verification.company.id,
				name: verification.company.name,
				activeJobs: verification.company.JobPost.length
			});
		}

		console.log('GET Company - No company with active jobs available');
		return NextResponse.json(
			{ error: 'No company with active jobs available' },
			{ status: 404 }
		);
	} catch (error) {
		console.error('GET Company - Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch company' },
			{ status: 500 }
		);
	}
}
