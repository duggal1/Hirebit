import { headers } from 'next/headers';

export async function getLocationFromIP() {
  try {
    const headersList = headers();
    const forwardedFor = (await headersList).get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Skip IP lookup in development
    if (process.env.NODE_ENV === 'development' || ip === '127.0.0.1') {
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
      };
    }

    // Use a free IP geolocation API
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city
      };
    }

    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  }
}
