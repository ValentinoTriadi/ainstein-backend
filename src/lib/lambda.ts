import { Lambda } from '@aws-sdk/client-lambda';

import { env } from '@/configs';

export const lambda = new Lambda({
  region: env.AWS_REGION || 'us-east-1',
});
