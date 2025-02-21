type SubscriptionDuration = '1' | '3' | '6';

export const PRICING = {
  BASE_MONTHLY_PRICE: 49.99,
  TAX_RATE: 0.1,
  DURATIONS: {
    '6': {
      days: 180, // 6 months
      price: 249.00,
      description: "Maximum exposure",
      discount: 0.17,
      savings: "Save 17%"
    },
    '3': {
      days: 90, // 3 months
      price: 129.00,
      description: "Extended visibility",
      discount: 0.14,
      savings: "Save 14%"
    },
    '1': {
      days: 30, // 1 month
      price: 49.99,
      description: "Standard listing",
      discount: 0,
      savings: null
    }
  } as Record<SubscriptionDuration, {
    days: number;
    price: number;
    description: string;
    discount: number;
    savings: string | null;
  }>
};

export const jobListingDurationPricing = Object.entries(PRICING.DURATIONS).map(
  ([key, value]) => ({
    days: value.days,
    price: value.price,
    description: value.description,
    savings: value.savings
  })
);