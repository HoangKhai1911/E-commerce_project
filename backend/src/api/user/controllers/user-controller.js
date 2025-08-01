'use strict';

/**
 * Custom user controller
 * Chứa các hàm xử lý thông tin cá nhân của người dùng đã đăng nhập.
 */
module.exports = {
  /**
   * PUT /api/user/me
   * Cập nhật thông tin cá nhân của người dùng đang đăng nhập.
   * Yêu cầu JWT token hợp lệ.
   */
  async updateMe(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Bạn cần đăng nhập để cập nhật thông tin.');
    }

    const { username, email, password } = ctx.request.body;
    
    // Tạo một đối tượng data để cập nhật
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      // Băm mật khẩu mới
      const passwordHash = await strapi.plugins['users-permissions'].services.user.hashPassword(password);
      updateData.password = passwordHash;
    }

    // Nếu không có dữ liệu để cập nhật, trả về lỗi
    if (Object.keys(updateData).length === 0) {
      return ctx.badRequest('Không có dữ liệu để cập nhật.');
    }

    try {
      // Cập nhật thông tin người dùng
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', userId, {
        data: updateData,
      });

      if (!updatedUser) {
        return ctx.notFound('Không tìm thấy người dùng để cập nhật.');
      }

      ctx.body = { message: 'Cập nhật thông tin thành công.' };
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      ctx.internalServerError('Cập nhật thông tin không thành công.');
    }
  },

  /**
   * DELETE /api/user/me
   * Xóa tài khoản của người dùng đang đăng nhập.
   * Yêu cầu JWT token hợp lệ.
   */
  async deleteMe(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Bạn cần đăng nhập để xóa tài khoản.');
    }

    try {
      // Xóa người dùng
      await strapi.entityService.delete('plugin::users-permissions.user', userId);
      ctx.body = { message: 'Tài khoản của bạn đã được xóa thành công.' };
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản:', error);
      ctx.internalServerError('Xóa tài khoản không thành công.');
    }
  },
};
