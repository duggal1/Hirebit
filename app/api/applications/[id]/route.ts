import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (typeof id !== "string") {
		return res.status(400).json({ error: "Invalid application ID" });
	}

	try {
		const application = await prisma.jobApplication.findUnique({
			where: { id },
			include: {
				job: {
					include: {
						company: {
							select: { name: true, location: true },
						},
					},
				},
			},
		});

		if (!application) {
			return res.status(404).json({ error: "Application not found" });
		}

		res.status(200).json(application);
	} catch (error) {
		console.error("Error fetching application:", error);
		res.status(500).json({ error: "Failed to fetch application" });
	} finally {
		await prisma.$disconnect();
	}
}