import { Lambda } from '@aws-sdk/client-lambda';

const lambda = new Lambda({
    region: Bun.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: Bun.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });

export default lambda;