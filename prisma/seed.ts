import { PrismaClient, JobPostStatus, UserType } from '@prisma/client';
import pkg from 'bcryptjs';
const { hash } = pkg;

const prisma = new PrismaClient();

async function main() {
  try {
    // Generate a unique email using timestamp
    const uniqueEmail = `tech.${Date.now()}@microsoft.com`;

    // First check if user exists
    let companyUser = await prisma.user.findUnique({
      where: { email: uniqueEmail }
    });

    if (!companyUser) {
      // Create new user if doesn't exist
      companyUser = await prisma.user.create({
        data: {
          email: uniqueEmail,
          name: 'Microsoft HR',
          hashedPassword: await hash('password123', 12),
          userType: UserType.COMPANY,
          onboardingCompleted: true,
        },
      });
    }

    // Check if company exists for this user
    let company = await prisma.company.findFirst({
      where: { userId: companyUser.id }
    });
    if (!company) {
      // Create new company if doesn't exist
      company = await prisma.company.create({
        data: {
          name: 'Microsoft',
          location: 'Redmond, WA',
          logo: 'https://blog.tmcnet.com/blog/rich-tehrani/uploads/old-microsoft-logo.jpg', // Updated image URL
          website: 'https://microsoft.com',
          xAccount: '@microsoft',
          about: 'Microsoft Corporation is a technology company that develops and supports software, services, devices, and solutions worldwide.',
          industry: 'Technology',
          userId: companyUser.id,
        },
      });
    }

 

    // Create job posts
    const jobPosts = [
      {
        jobTitle: 'Senior Frontend Engineer',
        employmentType: 'Full-time',
        location: 'Remote',
        salaryFrom: 120000,
        salaryTo: 180000,
        jobDescription: 'Looking for a Senior Frontend Engineer with React expertise...',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Remote Work', '401k'],
        status: JobPostStatus.ACTIVE,
        companyId: company.id
      },
      {
        jobTitle: 'Full Stack Developer (Next.js & Python)',
        employmentType: 'Full-time',
        location: 'Remote',
        salaryFrom: 120000,
        salaryTo: 180000,
        jobDescription: `
    We are seeking a highly skilled Full Stack Developer to join our innovative team. In this role, you will be responsible for designing, developing, and maintaining scalable web applications. You should have advanced expertise in **Next.js** for crafting dynamic and responsive front-end solutions, as well as strong experience in **Python** for building robust back-end services.
    
    **Key Responsibilities:**
    - Collaborate with cross-functional teams to translate business requirements into technical solutions.
    - Develop high-quality, maintainable code for both the frontend and backend.
    - Design and implement RESTful APIs and integrate them with front-end components.
    - Optimize applications for maximum speed and scalability.
    - Participate in code reviews, agile planning, and continuous improvement initiatives.
    
    **What We’re Looking For:**
    - Proficiency with Next.js, React, and modern JavaScript/TypeScript.
    - Strong experience in Python and familiarity with popular frameworks.
    - Understanding of cloud services, containerization (e.g., Docker), and CI/CD pipelines.
    - Excellent problem-solving skills and a passion for writing clean, efficient code.
    
    If you thrive in a fast-paced, collaborative environment and are eager to work with cutting-edge technologies, we’d love to hear from you.
        `,
        listingDuration: 60,
        benefits: ['Health Insurance', 'Flexible Hours', 'Stock Options'],
        status: JobPostStatus.ACTIVE,
        companyId: company.id // Ensure this references an existing company ID
      },

        {
          jobTitle: 'Full Stack Developer (Next.js & Python)',
          employmentType: 'Full-time',
          location: 'Remote',
          salaryFrom: 120000,
          salaryTo: 180000,
          jobDescription: `Seeking a Full Stack Developer skilled in Next.js for the frontend and Python for the backend. Develop and maintain scalable applications.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Full Stack Developer (Next.js & Python)',
          employmentType: 'Full-time',
          location: 'Remote',
          salaryFrom: 120000,
          salaryTo: 180000,
          jobDescription: ` 
We are seeking a highly skilled **Full Stack Engineer** to join our team at **Microsoft**. The ideal candidate will have expertise in **Next.js for the frontend** and **Python for the backend**, with a strong understanding of developing and maintaining scalable applications. You will collaborate with cross-functional teams to design, develop, and deploy high-quality software solutions while ensuring performance, security, and scalability.  

- **Frontend Development:**  
  - Expertise in **Next.js, React.js, and TypeScript** for building interactive and scalable web applications.  
  - Proficiency in modern **UI/UX principles** and frontend state management (e.g., Redux, Zustand, or React Context API).  
  - Strong understanding of **SSR (Server-Side Rendering), ISR (Incremental Static Regeneration), and CSR (Client-Side Rendering)**.  
  - Experience with **Tailwind CSS, Chakra UI, or Material-UI** for styling components.  
  - Knowledge of authentication methods such as **OAuth, JWT, and OpenID Connect**.  

- **Backend Development:**  
  - Strong experience with **Python frameworks** like **FastAPI, Django, or Flask** for building scalable APIs.  
  - Expertise in **RESTful API and GraphQL** development.  
  - Knowledge of **asynchronous programming** and event-driven architectures.  
  - Experience with **database management systems** (PostgreSQL, MySQL, MongoDB).  
  - Proficiency in **caching mechanisms** (Redis, Memcached) and **message brokers** (RabbitMQ, Kafka).  

.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Frontend Engineer (Next.js)',
          employmentType: 'Full-time',
          location: 'On-site',
          salaryFrom: 110000,
          salaryTo: 170000,
          jobDescription: `Looking for a Frontend Engineer with Next.js experience. Build dynamic, high-performance web interfaces.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Backend Developer (Python)',
          employmentType: 'Full-time',
          location: 'Hybrid',
          salaryFrom: 115000,
          salaryTo: 175000,
          jobDescription: `Seeking a Backend Developer proficient in Python. Develop RESTful APIs and ensure robust server-side logic.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Software Engineer',
          employmentType: 'Full-time',
          location: 'Remote',
          salaryFrom: 100000,
          salaryTo: 160000,
          jobDescription: `Join our team as a Software Engineer to work on modern web applications utilizing Next.js and Python.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Junior Frontend Developer',
          employmentType: 'Full-time',
          location: 'Remote',
          salaryFrom: 80000,
          salaryTo: 120000,
          jobDescription: `Entry-level Frontend Developer role focusing on Next.js to build responsive interfaces.`,
          listingDuration: 30,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Python Developer',
          employmentType: 'Full-time',
          location: 'On-site',
          salaryFrom: 105000,
          salaryTo: 155000,
          jobDescription: `Seeking a Python Developer to work on backend services and data pipelines.`,
          listingDuration: 30,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Next.js Developer',
          employmentType: 'Full-time',
          location: 'Hybrid',
          salaryFrom: 115000,
          salaryTo: 165000,
          jobDescription: `Looking for a developer proficient in Next.js to craft dynamic and scalable front-end applications.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Backend Engineer (Django/Python)',
          employmentType: 'Full-time',
          location: 'Remote',
          salaryFrom: 110000,
          salaryTo: 170000,
          jobDescription: `Join as a Backend Engineer with Django expertise in Python to build efficient server-side solutions.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'Full Stack Engineer',
          employmentType: 'Full-time',
          location: 'Hybrid',
          salaryFrom: 120000,
          salaryTo: 180000,
          jobDescription: `We need a Full Stack Engineer skilled in both Next.js and Python. Develop end-to-end solutions for our products.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },
        {
          jobTitle: 'DevOps Engineer',
          employmentType: 'Full-time',
          location: 'Remote',
          salaryFrom: 115000,
          salaryTo: 175000,
          jobDescription: `Seeking a DevOps Engineer familiar with deploying applications built in Next.js and Python. Manage CI/CD pipelines and cloud infrastructure.`,
          listingDuration: 60,
          benefits: ['Health Insurance', 'Remote Work', '401k'],
          status: JobPostStatus.ACTIVE,
          companyId: company.id
        },

      
      {
        jobTitle: 'Backend Developer',
        employmentType: 'Full-time',
        location: 'Hybrid',
        salaryFrom: 130000,
        salaryTo: 190000,
        jobDescription: 'Seeking a Backend Developer with Node.js experience...',
        listingDuration: 30,
        benefits: ['Health Insurance', 'Flexible Hours', 'Stock Options'],
        status: JobPostStatus.ACTIVE,
        companyId: company.id
      }
    ];

    for (const jobPost of jobPosts) {
      try {
        await prisma.jobPost.create({
          data: {
            ...jobPost,
            companyId: company.id
          }
        });
        console.log(`Created job post: ${jobPost.jobTitle}`);
      } catch (error) {
        console.error(`Failed to create job post ${jobPost.jobTitle}:`, error);
        // Continue with next job post even if one fails
        continue;
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});