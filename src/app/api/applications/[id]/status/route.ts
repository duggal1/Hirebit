import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	if (!params?.id) {
		return NextResponse.json(
			{ error: "Application ID is required" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { status, isActive } = body;

		// Validate status
		const validStatuses = ['READY', 'NOT_READY', 'ACTIVE', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];
		if (!validStatuses.includes(status)) {
			return NextResponse.json(
				{ error: "Invalid status" },
				{ status: 400 }
			);
		}

		const updatedApplication = await prisma.jobApplication.update({
			where: {
				id: params.id
			},
			data: {
				status,
				isActive,
				lastActivity: new Date()
			},
			include: {
				job: {
					include: {
						company: {
							select: {
								name: true,
								location: true
							}
						}
					}
				}
			}
		});

		return NextResponse.json(updatedApplication);
	} catch (error) {
		console.error("Error updating application status:", error);
		return NextResponse.json(
			{ error: "Failed to update application status" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}