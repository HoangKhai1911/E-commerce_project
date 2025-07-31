// src/api/auth/controllers/verify.controller.js
const jwt = require('jsonwebtoken');

module.exports = {
  async verifyEmail(ctx) {
    try {
      const { token } = ctx.query;
      const decoded = jwt.verify(token, 'yourEmailSecretKey');

      await strapi.query('plugin::users-permissions.user').update({
        where: { id: decoded.id },
        data: { confirmed: true }
      });

      ctx.send({ message: 'Email đã được xác thực. Bạn có thể đăng nhập.' });
    } catch (err) {
      ctx.throw(400, 'Token không hợp lệ hoặc đã hết hạn.');
    }
  }
};