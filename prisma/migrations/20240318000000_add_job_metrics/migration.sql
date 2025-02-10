-- CreateTable
CREATE TABLE "job_metrics" (
	"id" TEXT NOT NULL,
	"jobPostId" TEXT NOT NULL,
	"totalViews" INTEGER NOT NULL DEFAULT 0,
	"totalClicks" INTEGER NOT NULL DEFAULT 0,
	"applications" INTEGER NOT NULL DEFAULT 0,
	"viewsByDate" JSONB NOT NULL,
	"clicksByDate" JSONB NOT NULL,
	"locationData" JSONB NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "job_metrics_pkey" PRIMARY KEY ("id")
);

-- AddColumns to job_posts
ALTER TABLE "job_posts" 
ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "job_metrics_jobPostId_key" ON "job_metrics"("jobPostId");

-- AddForeignKey
ALTER TABLE "job_metrics" ADD CONSTRAINT "job_metrics_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;