export default {
  routes: [
    {
      method: 'POST',
      path: '/user-preferences',
      handler: 'user-preference.create',
      config: {
        auth: {
          // Chỉ cho phép role Authenticated
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/user-preferences',
      handler: 'user-preference.find',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ],
};