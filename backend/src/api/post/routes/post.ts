'use strict';

/**
 * This is a custom router for the 'post' API.
 * It defines explicit routes to avoid ambiguity between numeric IDs and string slugs.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find', // Core action
      config: {
        auth: false,
      },
    },
    {
      // This route specifically matches numeric IDs.
      // The regex (\\d+) ensures that only requests with numbers (e.g., /posts/123) are handled here.
      method: 'GET',
      path: '/posts/:id(\\d+)',
      handler: 'post.findOne', // Core action
      config: {
        auth: false,
      },
    },
    {
      // This route will now handle requests with non-numeric slugs (e.g., /posts/my-awesome-post).
      // It points to our custom controller action.
      method: 'GET',
      path: '/posts/:slug',
      handler: 'post.findOneBySlug', // Custom action
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/posts/:id/click',
      handler: 'post.recordClick', // Custom action
      config: {
        auth: false,
      },
    },
    // You can add other core routes (create, update, delete) here if needed.
  ],
};
