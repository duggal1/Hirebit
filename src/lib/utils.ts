import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}


export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 



interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

export class RateLimit {
  private state: RateLimitState;
  private interval: number;
  private maxTokens: number;

  constructor(config: RateLimitConfig) {
    this.interval = config.interval;
    this.maxTokens = config.uniqueTokenPerInterval;
    this.state = {
      tokens: config.uniqueTokenPerInterval,
      lastRefill: Date.now()
    };
  }

  async check(): Promise<boolean> {
    const now = Date.now();
    const timePassed = now - this.state.lastRefill;

    // Refill tokens if interval has passed
    if (timePassed >= this.interval) {
      this.state.tokens = this.maxTokens;
      this.state.lastRefill = now;
    }

    // Check if we have tokens available
    if (this.state.tokens > 0) {
      this.state.tokens--;
      return true;
    }

    throw new Error('Rate limit exceeded');
  }
}

// Helper function to create a rate limiter instance
export function rateLimit(config: RateLimitConfig): RateLimit {
  return new RateLimit(config);
}