export default {
  routes: [
    {
      method: 'GET',
      path: '/seed',
      handler: 'seed.seed',   // <controllerName>.<methodName>
      config: {
        auth: false,          // Tùy chọn: Cho phép public gọi seed
      },
    },
  ],
};
