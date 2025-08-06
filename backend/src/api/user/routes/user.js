module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/user/me',
      handler: 'user-controller.updateMe',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated'],
      }
    },
    {
      method: 'DELETE',
      path: '/user/me',
      handler: 'user-controller.deleteMe',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated'],
      }
    }
  ],
};
