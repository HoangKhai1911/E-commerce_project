export default {
  routes: [
    {
      method: 'GET',
      path: '/recommendations/unauthenticated',
      handler: 'recommendation.getUnauthenticatedRecommendations',
      config: {
        auth: {
          strategy: 'public',
        },
      },
    },
    {
      method: 'GET',
      path: '/recommendations/authenticated',
      handler: 'recommendation.getAuthenticatedRecommendations',
      config: {
        auth: {
          strategy: 'jwt',
        },
      },
    },
    {
      method: 'GET',
      path: '/recommendations/related/:id',
      handler: 'recommendation.getRelatedPosts',
      config: {
        auth: {
          strategy: 'jwt',
        },
      },
    },
  ],
};
