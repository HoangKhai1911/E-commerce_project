'use strict';

/**
 * auth router
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'auth-controller.register',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'auth-controller.login',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'auth-controller.me',
      config: {
        auth: {
            strategy: 'jwt'
        }
      },
    },
    {
      method: 'GET',
      path: '/auth/verify-email',
      handler: 'auth-controller.verifyEmail',
      config: {
        auth: false,
      },
    },
  ],
};
