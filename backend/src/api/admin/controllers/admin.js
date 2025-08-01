'use strict';

/**
 * A set of functions called "actions" for `admin`
 * Các chức năng dành riêng cho Admin (quản lý Source, Category, Post, User)
 */
module.exports = {

  // ------------------------- Chức năng Admin: Quản lý Source -------------------------
  /**
   * POST /api/admin/sources
   * Thêm một Source mới.
   */
  async createSource(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }
      
      const { name, url } = ctx.request.body;
      const newSource = await strapi.entityService.create('api::source.source', { data: { name, url } });
      
      ctx.body = newSource;
    } catch (error) {
      console.error('Lỗi khi tạo Source:', error);
      ctx.body = { error: 'Failed to create source', details: error.message };
      ctx.response.status = 500;
    }
  },
  
  /**
   * PUT /api/admin/sources/:id
   * Cập nhật một Source.
   */
  async updateSource(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const sourceId = ctx.params.id;
      const { name, url } = ctx.request.body;
      
      const updatedSource = await strapi.entityService.update('api::source.source', sourceId, { data: { name, url } });
      
      ctx.body = updatedSource;
    } catch (error) {
      console.error('Lỗi khi cập nhật Source:', error);
      ctx.body = { error: 'Failed to update source', details: error.message };
      ctx.response.status = 500;
    }
  },
  
  /**
   * DELETE /api/admin/sources/:id
   * Xóa một Source.
   */
  async deleteSource(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const sourceId = ctx.params.id;
      const deletedSource = await strapi.entityService.delete('api::source.source', sourceId);
      
      ctx.body = { message: `Source với ID ${deletedSource.id} đã được xóa thành công.` };
    } catch (error) {
      console.error('Lỗi khi xóa Source:', error);
      ctx.body = { error: 'Failed to delete source', details: error.message };
      ctx.response.status = 500;
    }
  },

  // ------------------------- Chức năng Admin: Quản lý Category -------------------------
  /**
   * POST /api/admin/categories
   * Thêm một Category mới.
   */
  async createCategory(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const { name } = ctx.request.body;
      const newCategory = await strapi.entityService.create('api::category.category', { data: { name } });

      ctx.body = newCategory;
    } catch (error) {
      console.error('Lỗi khi tạo Category:', error);
      ctx.body = { error: 'Failed to create category', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * PUT /api/admin/categories/:id
   * Cập nhật một Category.
   */
  async updateCategory(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const categoryId = ctx.params.id;
      const { name } = ctx.request.body;

      const updatedCategory = await strapi.entityService.update('api::category.category', categoryId, { data: { name } });

      ctx.body = updatedCategory;
    } catch (error) {
      console.error('Lỗi khi cập nhật Category:', error);
      ctx.body = { error: 'Failed to update category', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * DELETE /api/admin/categories/:id
   * Xóa một Category.
   */
  async deleteCategory(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const categoryId = ctx.params.id;
      const deletedCategory = await strapi.entityService.delete('api::category.category', categoryId);

      ctx.body = { message: `Category với ID ${deletedCategory.id} đã được xóa thành công.` };
    } catch (error) {
      console.error('Lỗi khi xóa Category:', error);
      ctx.body = { error: 'Failed to delete category', details: error.message };
      ctx.response.status = 500;
    }
  },

  // ------------------------- Chức năng Admin: Quản lý Post -------------------------
  /**
   * DELETE /api/admin/posts/:id
   * Xóa một bài viết.
   */
  async deletePostByAdmin(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const postId = ctx.params.id;
      const deletedPost = await strapi.entityService.delete('api::post.post', postId);

      ctx.body = { message: `Bài viết với ID ${deletedPost.id} đã được xóa thành công.` };
    } catch (error) {
      console.error('Lỗi khi xóa bài viết (admin):', error);
      ctx.body = { error: 'Failed to delete post as admin', details: error.message };
      ctx.response.status = 500;
    }
  },

  // ------------------------- Chức năng Admin: Quản lý Người dùng -------------------------
  /**
   * DELETE /api/admin/delete-user/:id
   * Xóa tài khoản của một người dùng bất kỳ.
   */
  async deleteUserByAdmin(ctx) {
    try {
      const userRole = ctx.state.user.role;
      if (!userRole || userRole.name !== 'Admin') {
        return ctx.unauthorized('Bạn không có quyền thực hiện chức năng này.');
      }

      const userIdToDelete = ctx.params.id;
      const userToDelete = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userIdToDelete
      );
      if (!userToDelete) {
        return ctx.notFound('Người dùng cần xóa không tồn tại.');
      }

      await strapi.entityService.delete('plugin::users-permissions.user', userIdToDelete);

      ctx.body = { message: `Người dùng có ID ${userIdToDelete} đã được xóa thành công.` };
    } catch (error) {
      console.error('Lỗi khi xóa người dùng (admin):', error);
      ctx.body = { error: 'Failed to delete user profile as admin', details: error.message };
      ctx.response.status = 500;
    }
  },
};
