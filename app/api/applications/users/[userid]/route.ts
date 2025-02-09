import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { userId } = req.query;

	if (typeof userId !== "string") {
		return res.status(400).json({ error: "Invalid user ID" });
	}

	try {
		const applications = await prisma.jobApplication.findMany({
			where: {
				jobSeekerId: userId
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
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		const stats = {
			total: applications.length,
			pending: applications.filter(app => app.status === 'PENDING').length,
			accepted: applications.filter(app => app.status === 'ACCEPTED').length,
			rejected: applications.filter(app => app.status === 'REJECTED').length,
			active: applications.filter(app => app.isActive).length
		};

		res.status(200).json({ applications, stats });
	} catch (error) {
		console.error("Error fetching applications:", error);
		res.status(500).json({ error: "Failed to fetch applications" });
	} finally {
		await prisma.$disconnect();
	}
}