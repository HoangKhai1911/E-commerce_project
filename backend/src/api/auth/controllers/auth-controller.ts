const controller = {
  async register(ctx) {
    console.log('✅ Register called');
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest('Missing required fields');
    }

    try {
      const user = await strapi.plugins['users-permissions'].services.user.add({
        username,
        email,
        password,
        confirmed: true,
      });

      const token = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });

      ctx.send({ jwt: token, user });
    } catch (err) {
      ctx.internalServerError('User creation failed');
    }
  },

  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    if (!identifier || !password) {
      return ctx.badRequest('Missing credentials');
    }

    try {
      const user = await strapi.plugins['users-permissions'].services.user.fetchAuthenticatedUser(
        identifier,
        password
      );

      if (!user) return ctx.unauthorized('Invalid credentials');

      const token = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });

      ctx.send({ jwt: token, user });
    } catch (err) {
      ctx.internalServerError('Login failed');
    }
  },

  async me(ctx) {
    const user = ctx.state?.user;

    if (!user) return ctx.unauthorized('Not logged in');

    ctx.send({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  },
};

export default controller;