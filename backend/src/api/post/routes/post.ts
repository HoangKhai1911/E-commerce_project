// src/api/post/routes/post.ts

const routes = [
  {
    method: 'POST',
    path: '/posts/:id/click',
    handler: 'post.recordClick',
    config: {
      auth: false,
    },
  },
];

export default {
  routes,
};