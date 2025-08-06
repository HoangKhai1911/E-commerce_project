module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/user/me',
      handler: 'userController.updateMe',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated'],
      }
    },
    {
      method: 'DELETE',
      path: '/user/me',
      handler: 'userController.deleteMe',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated'],
      }
    }
  ],
};
