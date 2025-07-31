export default async (ctx, next) => {
  const user = ctx.state.user;
  if (!user) {
    return ctx.unauthorized('Login required');
  }

  await next();
};