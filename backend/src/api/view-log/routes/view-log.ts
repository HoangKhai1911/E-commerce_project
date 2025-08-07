/**
 * view-log router
 */
'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/view-log/stats',
      handler: 'view-log.stats',
      config: {
        policies: ['global::is-admin'],
      },
    },
    {
      method: 'GET',
      path: '/view-log/daily-views',
      handler: 'view-log.dailyViews',
      config: {
        policies: ['global::is-admin'],
      },
    },
  ],
};

