export default [
  {
    method: 'POST',
    path: '/custom-login',
    handler: 'api::auth.auth-controller.login',
    config: {
      auth: {
        scope: ['api::auth.auth-controller.login']
      }
    },
  },
  {
    method: 'POST',
    path: '/custom-register',
    handler: 'api::auth.auth-controller.register',
    config: {
      auth: {
        scope: ['api::auth.auth-controller.register']
      }
    },
  },
  {
  method: 'GET',
  path: '/me',
  handler: 'api::auth.auth-controller.me',
  config: {
    auth: {
      scope: ['api::auth.auth-controller.me']
    }
  },
}
];