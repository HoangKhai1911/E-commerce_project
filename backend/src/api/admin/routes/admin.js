module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/admin/sources',
      handler: 'admin.createSource',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/admin/sources/:id',
      handler: 'admin.updateSource',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/admin/sources/:id',
      handler: 'admin.deleteSource',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/admin/categories',
      handler: 'admin.createCategory',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/admin/categories/:id',
      handler: 'admin.updateCategory',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/admin/categories/:id',
      handler: 'admin.deleteCategory',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/admin/posts/:id',
      handler: 'admin.deletePostByAdmin',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/admin/delete-user/:id',
      handler: 'admin.deleteUserByAdmin',
      config: {
        policies: [],
      },
    },
  ],
};
