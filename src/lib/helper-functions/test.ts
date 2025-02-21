export function generateTestId(jobSeekerId: string): string {
    const uniqueId = crypto.randomUUID();
    return `test_${jobSeekerId}_${uniqueId}`;
  }