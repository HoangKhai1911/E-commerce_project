export default {
  routes: [
    {
      method: 'GET',
      path: '/recommendations/public',
      handler: 'recommendation.public',
      config: {
        auth: false
      }
    }
  ]
};