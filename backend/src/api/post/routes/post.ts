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
    {
      method: 'PUT',
      path: '/posts/:id',
      handler: 'post.update',
    },
    {
      method: 'DELETE',
      path: '/posts/:id',
      handler: 'post.delete', // This route enables the 'delete' permission in the admin panel.
    },
  ],
};
