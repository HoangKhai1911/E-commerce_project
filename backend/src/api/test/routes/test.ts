'use strict';

export default {
  routes: [
    {
      method: 'GET',
      path: '/send-test-email',
      handler: 'test.sendTestEmail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};