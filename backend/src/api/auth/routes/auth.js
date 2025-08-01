'use strict';

/**
 * auth router
 */
module.exports = {
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
        policies: ['global::is-authenticated'], // Yêu cầu người dùng đã đăng nhập
      },
    },
    {
      method: 'GET',
      path: '/auth/verify-email',
      handler: 'verify.verifyEmail',
      config: {
        auth: false,
      },
    },
  ],
};
