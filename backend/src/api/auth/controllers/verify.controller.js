const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * GET /api/auth/verify-email?token=<token>
   * Xác thực email của người dùng bằng JWT token.
   */
  async verifyEmail(ctx) {
    try {
      const { token } = ctx.query;

      if (!token) {
        return ctx.badRequest('Không tìm thấy token xác thực.');
      }
      
      const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

      // Cập nhật trường 'confirmed' của người dùng thành true
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', decoded.id, {
        data: { confirmed: true }
      });
      
      if (!updatedUser) {
        return ctx.notFound('Người dùng không tồn tại.');
      }
      
      ctx.send({ message: 'Email đã được xác thực thành công. Bạn có thể đăng nhập.' });
    } catch (err) {
      console.error('Lỗi khi xác thực email:', err);
      // Xử lý lỗi khi token không hợp lệ hoặc đã hết hạn
      ctx.throw(400, 'Token không hợp lệ hoặc đã hết hạn.');
    }
  }
};
