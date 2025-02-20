import { stripe } from '@/app/utils/stripe';
import { NextResponse } from 'next/server';

import { z } from 'zod';

// Define price mapping type and values
// Define price mapping type and values
type PriceId = 'price_1QuYsyRw85cV5wwQ5dPUcH75' | 'price_1QuYqlRw85cV5wwQsiwP2aFK' | 'price_1QuYs7Rw85cV5wwQZfNT5mIg';

const PRICE_MAPPING: Record<PriceId, number> = {
  'price_1QuYsyRw85cV5wwQ5dPUcH75': 4900,    // $49.00 - Basic job posting
  'price_1QuYqlRw85cV5wwQsiwP2aFK': 12900,                           // $129.00 - Premium job posting
  'price_1QuYs7Rw85cV5wwQZfNT5mIg': 24900,                           // $249.00 - Featured job posting
};

// Request validation schema
const paymentRequestSchema = z.object({
  priceId: z.string().min(1),
  jobId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = paymentRequestSchema.safeParse(body);

    if (!result.success) {
      console.error('Validation error:', result.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.errors },
        { status: 400 }
      );
    }

    const { priceId, jobId } = result.data;

    // Validate price ID exists in mapping
    if (!(priceId in PRICE_MAPPING)) {
      return NextResponse.json(
        { error: `Invalid price ID: ${priceId}` },
        { status: 400 }
      );
    }

    // Get amount from price mapping
    const amount = PRICE_MAPPING[priceId as PriceId];

    console.log('Creating payment intent:', { priceId, jobId, amount });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        priceId,
        jobId,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    });

    // Return success response
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error) {
    // Handle specific Stripe errors
    if (error instanceof stripe.errors.StripeError) {
      console.error('Stripe API error:', {
        type: error.type,
        code: error.code,
        message: error.message,
      });

      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          type: error.type,
        },
        { status: error.statusCode || 500 }
      );
    }

    // Handle general errors
    console.error('Payment API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}