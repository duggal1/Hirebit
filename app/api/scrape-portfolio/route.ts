
import { NextResponse } from 'next/server';

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;
    const response = await fetch(scraperUrl);

    if (!response.ok) {
      throw new Error(`Scraping failed: ${response.statusText}`);
    }

    const html = await response.text();
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape portfolio' },
      { status: 500 }
    );
  }
}
