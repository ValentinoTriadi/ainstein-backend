import { OpenAPIHono } from '@hono/zod-openapi';

import { healthRouter, protectedHealthRouter } from './health.controller';
import { studyKitGroupProtectedRouter } from './study-kit-group.controller';
import { studyKitProtectedRouter } from './study-kit.controller';
import { videoProtectedRouter } from './video.controller';

const unprotectedRouter = new OpenAPIHono();
unprotectedRouter.route('/', healthRouter);

const protectedRouter = new OpenAPIHono();
protectedRouter.route('/', protectedHealthRouter);
protectedRouter.route('/', studyKitGroupProtectedRouter);
protectedRouter.route('/', studyKitProtectedRouter);
protectedRouter.route('/', videoProtectedRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedRouter);
apiRouter.route('/', protectedRouter);
