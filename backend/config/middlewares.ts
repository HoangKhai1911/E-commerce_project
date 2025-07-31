export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
   {
    resolve: './src/middlewares/rate-limit.js',
    config: {
      max: 20,
      duration: 60000,
      errorMessage: 'Bạn gửi quá nhanh, thử lại sau 1 phút',
    },
  },

];
