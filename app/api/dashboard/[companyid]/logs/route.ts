import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    console.log('\n🔍 Starting Dashboard Logs API request...');
    const { companyid } = await Promise.resolve(params);
    console.log('Company ID from URL:', companyid);

    // Verify company exists by searching using companyID field (adjust if necessary)
    const company = await prisma.company.findUnique({
      where: { companyID: companyid }
    });
    if (!company) {
      console.log('❌ Company not found');
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    console.log('✅ Found Company:', company.name, '| Internal ID:', company.id);

    // Retrieve all job posts for this company (using the internal company.id)
    const jobPosts = await prisma.jobPost.findMany({
      where: { companyId: company.id },
      include: {
        metrics: true,
        codingQuestions: true
      }
    });
    console.log(`📋 Found ${jobPosts.length} job posts for company "${company.name}"`);
    console.log('Job Posts Data:', jobPosts);

    // Retrieve all job applications for the above job posts
    const jobApplications = await prisma.jobApplication.findMany({
      where: {
        jobId: { in: jobPosts.map(post => post.id) }
      },
      include: {
        jobSeeker: {
          include: {
            JobSeekerResume: {
              where: {
                isActive: true
              },
              select: {
                resumeId: true,
                resumeName: true,
                resumeBio: true,
                pdfUrlId: true,
                version: true,
                isActive: true,
                keywords: true,
                parsedData: true,
                recruiterViews: true,
                lastViewedAt: true,
                rating: true,
                tags: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        job: {
          include: {
            metrics: true,
            codingQuestions: true
          }
        }
      }
    });
    console.log(`📝 Found ${jobApplications.length} job applications for the company's job posts`);
    console.log('Job Applications Data:', jobApplications);

    // Extract unique job seeker IDs from these applications
    const jobSeekerIds = [...new Set(jobApplications.map(app => app.jobSeekerId))];
    console.log(`👤 Extracted ${jobSeekerIds.length} unique job seeker IDs`);

    // Retrieve full details of these job seekers, including their resumes and their applications for these posts
    const jobSeekers = await prisma.jobSeeker.findMany({
      where: {
        id: { in: jobSeekerIds }
      },
      include: {
        JobSeekerResume: {
          select: {
            resumeId: true,
            resumeName: true,
            resumeBio: true,
            pdfUrlId: true,
            version: true,
            isActive: true,
            keywords: true,
            parsedData: true,
            recruiterViews: true,
            lastViewedAt: true,
            rating: true,
            tags: true,
            createdAt: true,
            updatedAt: true
          }
        },
        applications: {
          where: {
            jobId: { in: jobPosts.map(post => post.id) }
          },
          include: {
            job: {
              include: {
                metrics: true,
                codingQuestions: true
              }
            }
          }
        }
      }
    });
    console.log(`👥 Fetched ${jobSeekers.length} job seekers with details`);
    console.log('Job Seekers Data:', jobSeekers);

    // Extra logging for each job seeker's resume data
    jobSeekers.forEach(seeker => {
      if (seeker.JobSeekerResume.length === 0) {
        console.log(`📝 Resumes for Job Seeker "${seeker.name}" (ID: ${seeker.id}): No resume data found.`);
      } else {
        seeker.JobSeekerResume.forEach((resume, idx) => {
          console.log(`📝 Resume ${idx + 1} for Job Seeker "${seeker.name}" (ID: ${seeker.id}):`);
          console.log(`   - Resume Name: ${resume.resumeName}`);
          console.log(`   - Resume Bio: ${resume.resumeBio}`);
          console.log(`   - PDF URL: ${resume.pdfUrlId}`);
        });
      }
    });

    // Transform the data to structure the job application logs per job seeker
    const transformedData = jobSeekers.map(seeker => {
      console.log(`\n🔄 Processing job seeker: ${seeker.name}`);
      return {
        id: seeker.id,
        name: seeker.name,
        email: seeker.email,
        phoneNumber: seeker.phoneNumber,
        location: seeker.location,
        // List of job applications submitted by this job seeker (only for this company's job posts)
        jobApplications: seeker.applications.map(app => ({
          id: app.id,
          status: app.status, // Enum value (e.g., "PENDING", "REVIEWED", etc.)
          coverLetter: app.coverLetter,
          resume: app.resume,
          includeLinks: app.includeLinks,
          answers: app.answers,
          aiScore: app.aiScore,
          isActive: app.isActive,
          lastActivity: app.lastActivity,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
      
          // Job details for the application
          job: {
            id: app.job.id,
            title: app.job.jobTitle,
            employmentType: app.job.employmentType,
            status: app.job.status, // Enum value (e.g., "ACTIVE", "DRAFT", etc.)
            location: app.job.location,
            salary: {
              from: app.job.salaryFrom,
              to: app.job.salaryTo
            },
            applicationData: {
              coverLetter: app.coverLetter,
              resume: app.resume,
              includeLinks: app.includeLinks,
              answers: {
                ...(app.answers as any)?.set || {},
                resumeData: seeker.JobSeekerResume?.[0] ? {
                  resumeName: seeker.JobSeekerResume[0].resumeName,
                  resumeBio: seeker.JobSeekerResume[0].resumeBio,
                  pdfUrlId: seeker.JobSeekerResume[0].pdfUrlId
                } : null
              },
              certifications: app.certifications,
              education: app.education,
              expectedSalaryMin: app.expectedSalaryMin,
              expectedSalaryMax: app.expectedSalaryMax,
              location: app.location,
              phoneNumber: app.phoneNumber,
              desiredEmployment: app.desiredEmployment
            },
           // status: app.status,
            aiScore: app.aiScore,
            isActive: app.isActive,
            lastActivity: app.lastActivity,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            requirements: {
              skills: app.job.skillsRequired,
              experience: app.job.requiredExperience,
              position: app.job.positionRequirement
            },
            metrics: app.job.metrics,
            codingQuestions: app.job.codingQuestions
          },
          recruiterData: {
            notes: app.recruiterNotes,
            feedback: app.interviewFeedback,
            stage: app.applicationStage,
            lastReviewed: app.lastReviewedAt,
            reviewedBy: app.reviewedBy
          },
          assessment: {
            cultureFitScore: app.cultureFitScore,
            communicationScore: app.communicationScore,
            technicalSkillsAssessment: app.technicalSkillsAssessment,
            codingTestResults: app.codingTestResults
          }
        })),
        // Include job seeker resume details
        resumes: seeker.JobSeekerResume.map(resume => ({
          id: resume.resumeId,
          name: resume.resumeName,
          bio: resume.resumeBio,
          pdfUrl: resume.pdfUrlId,
          version: resume.version,
          isActive: resume.isActive,
          keywords: resume.keywords,
          parsedData: resume.parsedData,
          recruiterMetrics: {
            views: resume.recruiterViews,
            lastViewed: resume.lastViewedAt,
            rating: resume.rating,
            tags: resume.tags
          },
          timestamps: {
            created: resume.createdAt,
            updated: resume.updatedAt
          }
        })),
        // Metadata for the job seeker
        metadata: {
          createdAt: seeker.createdAt,
          updatedAt: seeker.updatedAt,
          lastAttempt: seeker.lastAttemptAt
        }
      };
    });

    console.log('\n✅ Processing complete');
    console.log(`Returning ${transformedData.length} job seekers with application logs`);

    return NextResponse.json(transformedData);
    
  } catch (error: any) {
    console.error('\n❌ Error fetching dashboard logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard logs', details: error.message },
      { status: 500 }
    );
  }
}
