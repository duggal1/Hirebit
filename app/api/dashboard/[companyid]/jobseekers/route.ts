import { prisma } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { companyid: string } }
) {
  try {
    console.log('\n🔍 Starting API request...');
    const { companyid } = await Promise.resolve(params);
    console.log('Company ID:', companyid);

    // First verify company exists
    const company = await prisma.company.findUnique({
      where: { companyID: companyid }
    });

    if (!company) {
      console.log('❌ Company not found');
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    console.log('✅ Found company:', company.name);

    // Get all job posts for this company
    const jobPosts = await prisma.jobPost.findMany({
      where: { companyId: company.id },
      include: {
        metrics: true,
        codingQuestions: true
      }
    });
    console.log(`📋 Found ${jobPosts.length} job posts`);
    console.log('Job Posts Data:', jobPosts);

    // Get all applications with complete details
    const jobApplications = await prisma.jobApplication.findMany({
      where: {
        jobId: {
          in: jobPosts.map(post => post.id)
        }
      },
      include: {
        jobSeeker: {
          include: {
            // Include JobSeekerResume data along with job seeker details
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
              include: {
                job: true
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
    console.log(`📝 Found ${jobApplications.length} job applications`);
    console.log('Job Applications Data:', jobApplications);

    // Get unique job seeker IDs
    const jobSeekerIds = [...new Set(jobApplications.map(app => app.jobSeekerId))];
    console.log(`👤 Found ${jobSeekerIds.length} unique job seekers`);

    // Fetch complete job seeker details including their resumes and filtered applications
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

    // Extra log for JobSeekerResume data for each job seeker
    jobSeekers.forEach(seeker => {
      if (seeker.JobSeekerResume.length === 0) {
        console.log(`📝 Resumes for Job Seeker ${seeker.name} (ID: ${seeker.id}): No resume data found.`);
      } else {
        seeker.JobSeekerResume.forEach((resume, idx) => {
          console.log(`📝 Resume ${idx + 1} for Job Seeker ${seeker.name} (ID: ${seeker.id}):`);
          console.log(`   - Resume Name: ${resume.resumeName}`);
          console.log(`   - Resume Bio: ${resume.resumeBio}`);
          console.log(`   - PDF URL: ${resume.pdfUrlId}`);
        });
      }
    });

    // Filter out job seekers who have no applications at all
    const jobSeekersWithApplications = jobSeekers.filter(seeker => {
      return seeker.applications && seeker.applications.length > 0;
    });
    console.log(`\n🔍 After filtering, ${jobSeekersWithApplications.length} job seekers have at least one application.`);

    // Transform the data with all details
    const transformedData = jobSeekersWithApplications.map(seeker => {
      console.log(`\n🔄 Processing job seeker: ${seeker.name}`);
      return {
        // Basic Info
        id: seeker.id,
        name: seeker.name,
        email: seeker.email,
        phoneNumber: seeker.phoneNumber,
        location: seeker.location,
        bio: seeker.about    ,     

        // Professional Details
        currentJobTitle: seeker.currentJobTitle,
        industry: seeker.industry,
        experience: seeker.experience,
        yearsOfExperience: seeker.yearsOfExperience, 
         
        about: seeker.about,      
        skills: seeker.skills,
        jobSearchStatus: seeker.jobSearchStatus,
        previousJobExperience: seeker.previousJobExperience,

        // Education & Certifications
        education: seeker.education,
        educationDetails: seeker.educationDetails,
        certifications: seeker.certifications,

        // Job Preferences
        expectedSalary: {
          min: seeker.expectedSalaryMin,
          max: seeker.expectedSalaryMax
        },
        preferences: {
          location: seeker.preferredLocation,
          remote: seeker.remotePreference,
          relocate: seeker.willingToRelocate,
          employmentType: seeker.desiredEmployment,
          availabilityPeriod: seeker.availabilityPeriod,
          availableFrom: seeker.availableFrom
        },

        // Professional Links
        links: {
          linkedin: seeker.linkedin,
          github: seeker.github,
          portfolio: seeker.portfolio,
          resume: seeker.resume
        },

        // Resumes (from JobSeekerResume)
        resumes: seeker.JobSeekerResume.map(resume => ({
          id: resume.resumeId,
          name: resume.resumeName,
          bio: resume.resumeBio,
          pdf: resume.pdfUrlId,
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

        // Applications
        applications: seeker.applications.map(app => ({
          id: app.id,
          status: app.status,
          coverLetter: app.coverLetter,
          resume: app.resume,
          includeLinks: app.includeLinks,
          answers: app.answers,
          aiScore: app.aiScore,
          isActive: app.isActive,
          job: {
            id: app.job.id,
            title: app.job.jobTitle,
            type: app.job.employmentType,
            location: app.job.location,
            salary: {
              from: app.job.salaryFrom,
              to: app.job.salaryTo
            },
            requirements: {
              skills: app.job.skillsRequired,
              experience: app.job.requiredExperience,
              position: app.job.positionRequirement
            },
            metrics: app.job.metrics,
            codingQuestions: app.job.codingQuestions
          },
          assessment: {
            aiScore: app.aiScore,
            cultureFitScore: app.cultureFitScore,
            communicationScore: app.communicationScore,
            technical: app.technicalSkillsAssessment,
            codingResults: app.codingTestResults
          },
          recruiterData: {
            notes: app.recruiterNotes,
            feedback: app.interviewFeedback,
            stage: app.applicationStage,
            lastReviewed: app.lastReviewedAt,
            reviewedBy: app.reviewedBy
          },
          timeline: {
            created: app.createdAt,
            updated: app.updatedAt,
            lastActivity: app.lastActivity
          }
        })),

        // Metadata
        metadata: {
          createdAt: seeker.createdAt,
          updatedAt: seeker.updatedAt,
          lastAttempt: seeker.lastAttemptAt
        }
      };
    });

    console.log('\n✅ Processing complete');
    console.log(`Returning ${transformedData.length} complete records`);

    return NextResponse.json(transformedData);
    
  } catch (error: any) {
    console.error('\n❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job seekers data', details: error.message },
      { status: 500 }
    );
  }
}
