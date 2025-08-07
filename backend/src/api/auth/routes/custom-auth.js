'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/refresh-token',
      handler: 'auth-controller.refreshToken',
      config: {
        auth: false, // Endpoint này không yêu cầu access token
        policies: [],
        middlewares: [],
      },
    },
  ],
};