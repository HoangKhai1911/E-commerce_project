export default {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/posts/:id(\\d+)',
      handler: 'post.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/posts/:slug',
      handler: 'post.findOneBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/posts/:id/click',
      handler: 'post.recordClick',
      config: {
        auth: false,
      },
    },
  ],
};
