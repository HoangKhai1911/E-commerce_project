'use strict';

module.exports = [
  {
    method: 'POST',
    path: '/custom-auth/register',
    handler: 'custom-auth.register',
    config: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/custom-auth/login',
    handler: 'custom-auth.login',
    config: {
      auth: false, 
    },
  },
  {
    method: 'GET',
    path: '/custom-auth/me',
    handler: 'custom-auth.me',
    config: {
      auth: "jwt",
    },
  },
  {
    method: 'GET',
    path: '/custom-auth/verify-email',
    handler: 'custom-auth.verifyEmail',
    config: {
      auth: false,
    },
  },
];
