import { JSDOM } from 'jsdom';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import doc from 'pdfkit';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const fetchPortfolioData = async (url: string) => {
  try {
    console.log('Starting portfolio scraping for:', url);

    // Enhanced fetching with multiple fallbacks
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioAnalyzer/1.0)',
      },
      timeout: 10000,
    });

    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    // Enhanced data extraction
    const portfolioData = {
      basics: extractBasicInfo(doc),
      projects: extractProjects(doc),
      skills: extractSkills(doc),
      experience: extractExperience(doc),
      education: extractEducation(doc),
      socialLinks: extractSocialLinks(doc),
      contacts: extractContactInfo(doc),
      technologies: extractTechnologies(doc),
      metadata: extractMetadata(doc, url)
    };

    // AI-powered analysis using Gemini
    const analysis = await analyzeWithGemini(portfolioData);

    return {
      data: portfolioData,
      analysis
    };

  } catch (error) {
    console.error('Portfolio scraping failed:', error);
    throw new Error(`Scraping failed: ${(error as Error).message}`);
  }
};

function extractBasicInfo(doc: Document) {
  return {
    name: getContent(doc, [
      'h1', 
      '[class*="name"]', 
      '[class*="title"]',
      'header h1',
      '.profile-name'
    ]),
    title: getContent(doc, [
      'h2',
      '[class*="title"]',
      '[class*="role"]',
      '.profile-title'
    ]),
    bio: getContent(doc, [
      '[class*="about"]',
      '[class*="bio"]',
      '[class*="summary"]',
      '.profile-bio'
    ]),
    location: getContent(doc, [
      '[class*="location"]',
      '[class*="address"]',
      '.profile-location'
    ])
  };
}


function extractProjects(doc: Document) {
  const projectElements = [
    ...doc.querySelectorAll(
      '[class*="project"], [class*="portfolio"], article, .work-item'
    )
  ];

  return projectElements.map(element => ({
    title: getContent(element, ['h2', 'h3', '.title']),
    description: getContent(element, ['p', '.description']),
    technologies: extractTechStack(element),
    links: extractProjectLinks(element),  // Fixed: Was calling itself recursively
    images: extractImages(element),
    date: getContent(element, ['.date', '.period', '[datetime]'])
  }));
}

// Add missing functions
function extractProjectLinks(element: Element): Record<string, string> {
  const links: Record<string, string> = {};
  const anchors = element.querySelectorAll('a[href]');
  
  anchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (href) {
      const text = anchor.textContent?.trim().toLowerCase() || 'link';
      links[text] = href;
    }
  });
  
  return links;
}

function extractImages(element: Element): string[] {
  const images: string[] = [];
  const imgElements = element.querySelectorAll('img');
  
  imgElements.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      images.push(src);
    }
  });
  
  return images;
}

function structureAnalysis(analysisText: string) {
  try {
    // Parse the analysis text into structured data
    const lines = analysisText.split('\n').map(line => line.trim());
    
    return {
      strengths: extractSection(lines, 'Strengths'),
      weaknesses: extractSection(lines, 'Areas for Improvement'),
      suggestions: extractSection(lines, 'Recommendations'),
      technicalScore: extractScore(lines, 'Technical depth'),
      presentationScore: extractScore(lines, 'Project presentation'),
      seoScore: extractScore(lines, 'SEO'),
      contentScore: extractScore(lines, 'Content quality'),
      buzzwordScore: extractScore(lines, 'Buzzword usage'),
      projectQualityScore: extractScore(lines, 'Project quality'),
      detailedAnalysis: {
        projectQuality: {
          score: extractScore(lines, 'Project quality'),
          details: extractDetailedAnalysis(lines, 'Project quality'),
          improvements: extractImprovements(lines, 'Project quality')
        },
        skillPresentation: {
          score: extractScore(lines, 'Skill presentation'),
          details: extractDetailedAnalysis(lines, 'Skill presentation'),
          improvements: extractImprovements(lines, 'Skill presentation')
        },
        professionalImage: {
          score: extractScore(lines, 'Professional image'),
          details: extractDetailedAnalysis(lines, 'Professional image'),
          improvements: extractImprovements(lines, 'Professional image')
        },
        technicalDepth: {
          score: extractScore(lines, 'Technical depth'),
          details: extractDetailedAnalysis(lines, 'Technical depth'),
          improvements: extractImprovements(lines, 'Technical depth')
        },
        buzzwords: {
          score: extractScore(lines, 'Buzzword usage'),
          found: extractFoundBuzzwords(lines),
          suggestions: extractBuzzwordSuggestions(lines)
        }
      }
    };
  } catch (error) {
    console.error('Error structuring analysis:', error);
    return defaultAnalysisStructure();
  }
}

// Helper functions for structureAnalysis
function extractSection(lines: string[], sectionName: string): string[] {
  const startIndex = lines.findIndex(line => line.includes(sectionName));
  if (startIndex === -1) return [];
  
  const section: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i] === '') break;
    section.push(lines[i]);
  }
  return section;
}

function extractScore(lines: string[], category: string): number {
  const line = lines.find(l => l.toLowerCase().includes(category.toLowerCase()));
  if (!line) return 0;
  
  const match = line.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function extractDetailedAnalysis(lines: string[], category: string): string {
  const line = lines.find(l => l.toLowerCase().includes(category.toLowerCase()));
  return line || '';
}

function extractImprovements(lines: string[], category: string): string[] {
  const startIndex = lines.findIndex(l => 
    l.toLowerCase().includes(category.toLowerCase()) && 
    l.toLowerCase().includes('improvement'));
  if (startIndex === -1) return [];
  
  const improvements: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i] === '') break;
    improvements.push(lines[i]);
  }
  return improvements;
}

function extractFoundBuzzwords(lines: string[]): string[] {
  const startIndex = lines.findIndex(l => l.includes('Found buzzwords:'));
  if (startIndex === -1) return [];
  
  return lines[startIndex]
    .replace('Found buzzwords:', '')
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

function extractBuzzwordSuggestions(lines: string[]): string[] {
  const startIndex = lines.findIndex(l => l.includes('Buzzword suggestions:'));
  if (startIndex === -1) return [];
  
  return lines[startIndex]
    .replace('Buzzword suggestions:', '')
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

function defaultAnalysisStructure() {
  return {
    strengths: [],
    weaknesses: [],
    suggestions: [],
    technicalScore: 0,
    presentationScore: 0,
    seoScore: 0,
    contentScore: 0,
    buzzwordScore: 0,
    projectQualityScore: 0,
    detailedAnalysis: {
      projectQuality: { score: 0, details: '', improvements: [] },
      skillPresentation: { score: 0, details: '', improvements: [] },
      professionalImage: { score: 0, details: '', improvements: [] },
      technicalDepth: { score: 0, details: '', improvements: [] },
      buzzwords: { score: 0, found: [], suggestions: [] }
    }
  };
}



function extractSkills(doc: Document) {
  const skillSelectors = [
    '[class*="skill"]',
    '[class*="technology"]',
    '[class*="expertise"]',
    '.languages',
    '.tools'
  ];

  const skillElements: (string | undefined)[] = [];
  skillSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => skillElements.push(el.textContent?.trim()));
  });

  // Common skill keywords to look for
  const skillKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'ruby',
    'react', 'vue', 'angular', 'node', 'express', 'django',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'sql', 'nosql', 'mongodb', 'postgresql',
    'machine learning', 'ai', 'data science',
    'agile', 'scrum', 'leadership'
  ];

  const detectedSkills = new Set<string>();
  
  // Extract skills from specific elements
  skillElements.forEach(text => {
    if (text) {
      skillKeywords.forEach(skill => {
        if (text.toLowerCase().includes(skill.toLowerCase())) {
          detectedSkills.add(skill);
        }
      });
    }
  });

  return Array.from(detectedSkills);
}

function extractExperience(doc: Document) {
  const experienceSelectors = [
    '[class*="experience"]',
    '[class*="work"]',
    '[class*="career"]',
    '.job',
    '.position'
  ];

  const experiences: { company: string; role: string; period: string; description: string; responsibilities: string[]; }[] = [];
  
  experienceSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(element => {
      const experience = {
        company: getContent(element, ['.company', '[class*="company"]', 'h3']),
        role: getContent(element, ['.role', '[class*="title"]', 'h4']),
        period: getContent(element, ['.period', '.date', '[class*="duration"]']),
        description: getContent(element, ['.description', 'p']),
        responsibilities: extractListItems(element, ['ul', '.responsibilities'])
      };
      if (experience.company || experience.role) {
        experiences.push(experience);
      }
    });
  });

  return experiences;
}

function extractEducation(doc: Document) {
  const educationSelectors = [
    '[class*="education"]',
    '[class*="academic"]',
    '.degree',
    '.qualification'
  ];

  const education: { institution: string; degree: string; period: string; field: string; gpa: string; }[] = [];
  
  educationSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(element => {
      const edu = {
        institution: getContent(element, ['.school', '.university', 'h3']),
        degree: getContent(element, ['.degree', '.qualification', 'h4']),
        period: getContent(element, ['.period', '.date']),
        field: getContent(element, ['.field', '.major']),
        gpa: getContent(element, ['.gpa', '.grade'])
      };
      if (edu.institution || edu.degree) {
        education.push(edu);
      }
    });
  });

  return education;
}

function extractContactInfo(doc: Document) {
  return {
    email: extractEmail(doc),
    phone: extractPhone(doc),
    location: getContent(doc, [
      '[class*="location"]',
      '[class*="address"]',
      '.contact-location'
    ]),
    website: extractWebsite(doc)
  };
}

function extractTechnologies(doc: Document) {
  const techSelectors = [
    '[class*="technology"]',
    '[class*="stack"]',
    '[class*="tool"]',
    '.tech'
  ];

  const technologies = new Set<string>();
  
  // Common technology keywords
  const techKeywords = [
    // Frontend
    'html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular',
    // Backend
    'node', 'python', 'java', 'php', 'ruby', 'go', 'rust',
    // Databases
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab',
    // Tools & Frameworks
    'git', 'webpack', 'babel', 'sass', 'less', 'graphql', 'rest'
  ];

  // Extract from specific tech sections
  techSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(element => {
      const text = element.textContent?.toLowerCase() || '';
      techKeywords.forEach(tech => {
        if (text.includes(tech.toLowerCase())) {
          technologies.add(tech);
        }
      });
    });
  });

  return Array.from(technologies);
}

function extractMetadata(doc: Document, url: string) {
  return {
    title: doc.title,
    description: getMetaContent(doc, 'description'),
    keywords: getMetaContent(doc, 'keywords'),
    author: getMetaContent(doc, 'author'),
    url: url,
    lastUpdated: getMetaContent(doc, 'last-modified') || new Date().toISOString()
  };
}

// Helper functions

function extractEmail(doc: Document): string {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const text = doc.body.textContent || '';
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

function extractPhone(doc: Document): string {
  const phoneRegex = /(?:\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/;
  const text = doc.body.textContent || '';
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
}

function extractWebsite(doc: Document): string {
  const websiteSelectors = ['[class*="website"]', '.personal-site', 'a[href*="://"]'];
  for (const selector of websiteSelectors) {
    const element = doc.querySelector(selector);
    const href = element?.getAttribute('href');
    if (href && !href.includes('linkedin.com') && !href.includes('github.com')) {
      return href;
    }
  }
  return '';
}

function extractListItems(element: Element, selectors: string[]): string[] {
  for (const selector of selectors) {
    const list = element.querySelector(selector);
    if (list) {
      return Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
    }
  }
  return [];
}

function getMetaContent(doc: Document, name: string): string {
  const meta = doc.querySelector(`meta[name="${name}"]`) || 
               doc.querySelector(`meta[property="og:${name}"]`);
  return meta?.getAttribute('content') || '';
}

// ...existing code...

// Helper function to get content with multiple selectors
function getContent(element: Element | Document, selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const el = element.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text && text.length > 0) return text;
    } catch (e) {
      continue;
    }
  }
  return '';
}
// Add extractSocialLinks function
function extractSocialLinks(doc: Document) {
  const socialPatterns = {
    github: /github\.com/,
    linkedin: /linkedin\.com/,
    twitter: /twitter\.com/,
    medium: /medium\.com/,
    devto: /dev\.to/,
    stackoverflow: /stackoverflow\.com/,
    dribbble: /dribbble\.com/,
    behance: /behance\.net/
  };

  const links: Record<string, string> = {};
  const anchors = doc.querySelectorAll('a[href]');

  anchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (href) {
      Object.entries(socialPatterns).forEach(([platform, pattern]) => {
        if (pattern.test(href)) {
          links[platform] = href;
        }
      });
    }
  });

  return links;
}

// Add extractTechStack function
function extractTechStack(element: Element): string[] {
  const techKeywords = [
    'react', 'vue', 'angular', 'svelte', 'nextjs', 'nodejs',
    'typescript', 'javascript', 'python', 'java', 'go', 'rust',
    'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'graphql', 'rest', 'webpack', 'git', 'ci/cd'
  ];

  const text = element.textContent?.toLowerCase() || '';
  return techKeywords.filter(tech => text.includes(tech.toLowerCase()));
}

// Add analyzeWithGemini function
async function analyzeWithGemini(portfolioData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Analyze this portfolio data and provide detailed feedback:
      ${JSON.stringify(portfolioData, null, 2)}
      
      Please provide analysis in the following format:
      1. Technical depth analysis (score out of 100)
      2. Project presentation quality (score out of 100)
      3. Professional image assessment (score out of 100)
      4. SEO and content quality (score out of 100)
      5. Buzzword analysis
      6. Strengths (bullet points)
      7. Areas for improvement (bullet points)
      8. Specific recommendations
      
      For each category, provide detailed explanations and actionable improvements.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return structureAnalysis(response.text());
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return defaultAnalysisStructure();
  }
}
