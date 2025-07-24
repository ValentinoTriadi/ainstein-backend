import { createAuthRouter, createRouter } from '@/lib';
import { healthCheck } from '@/repositories/health.repository';
import { healthRoute, protectedHealthRoute } from '@/routes/health.route';

export const healthRouter = createRouter();
export const protectedHealthRouter = createAuthRouter();

healthRouter.openapi(healthRoute, async (c) => {
  const res = await healthCheck();
  return c.json(res, 200);
});

protectedHealthRouter.openapi(protectedHealthRoute, async (c) => {
  const user = c.var.user || undefined;
  const session = c.var.session || undefined;
  const res = await healthCheck();
  return c.json({ ...res, data: { user, session, ...res.data } }, 200);
});
