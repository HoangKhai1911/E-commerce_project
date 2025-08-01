'use strict';
const jwt = require('jsonwebtoken');
/**
 * Custom auth controller
 */
module.exports = {
  /**
   * POST /api/auth/register
   * Đăng ký người dùng tùy chỉnh.
   */
  async register(ctx) {
    console.log('✅ Register called');
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest('Thiếu các trường bắt buộc (username, email, password).');
    }

    try {
      // Sử dụng service của plugin users-permissions để tạo người dùng
      // Đặt confirmed: false để chờ xác minh email
      const newUser = await strapi.plugins['users-permissions'].services.user.add({
        username,
        email,
        password,
        confirmed: false, 
        role: 1, // Đặt vai trò mặc định (ví dụ: 'Authenticated')
        // Thêm avatar mặc định cho người dùng
        // Lưu ý: Bạn cần phải tải tệp default_avatar.png vào public/uploads
        avatar: {
            name: 'default_avatar.png',
            alternativeText: 'Default user avatar',
            caption: 'Default user avatar',
            width: 100, // Kích thước mặc định của ảnh
            height: 100, // Kích thước mặc định của ảnh
            hash: 'default_avatar_hash', // Cần có hash
            ext: '.png',
            mime: 'image/png',
            size: 1, // Kích thước tệp
            url: '/uploads/default_avatar.png',
            provider: 'local' // hoặc provider mà bạn sử dụng
        }
      });
      
      // Tạo JWT token riêng cho việc xác minh email
      const verificationToken = jwt.sign({ id: newUser.id }, process.env.EMAIL_VERIFICATION_SECRET, {
        expiresIn: '1h',
      });

      // Tạo đường link xác minh
      const verificationUrl = `${strapi.config.get('server.url')}/api/auth/verify-email?token=${verificationToken}`;

      // TODO: Gửi email với đường link xác minh
      // Dòng code này chỉ là ví dụ và cần được thay thế bằng logic gửi email thực tế
      console.log(`Gửi email xác minh tới ${email}. Link: ${verificationUrl}`);
      
      // Trả về thông báo thành công mà không trả về JWT
      ctx.body = {
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.',
      };
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      ctx.internalServerError('Đăng ký không thành công. Vui lòng thử lại.');
    }
  },

  /**
   * POST /api/auth/login
   * Xử lý đăng nhập của người dùng tùy chỉnh.
   * Lấy thông tin người dùng và JWT token.
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    if (!identifier || !password) {
      return ctx.badRequest('Tên đăng nhập hoặc mật khẩu không được để trống.');
    }

    try {
      // Strapi sẽ xử lý việc xác thực người dùng và trả về đối tượng người dùng
      const user = await strapi.plugins['users-permissions'].services.user.fetchAuthenticatedUser(
        identifier,
        password
      );

      if (!user) {
        return ctx.unauthorized('Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
      
      // Kiểm tra xem người dùng đã xác minh email chưa
      if (!user.confirmed) {
        return ctx.unauthorized('Vui lòng xác thực email của bạn trước khi đăng nhập.');
      }
      
      // Tạo JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });
      
      // Lấy thông tin chi tiết của người dùng
      const userProfile = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['categories', 'avatar'], // Thêm avatar vào populate
      });

      // Trả về thông tin cần thiết
      ctx.body = {
        jwt,
        user: {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          categories: userProfile.categories.map(category => ({
            id: category.id,
            name: category.name,
          })),
          avatar: userProfile.avatar,
        },
      };

    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      ctx.internalServerError('Đăng nhập không thành công. Vui lòng thử lại.');
    }
  },

  /**
   * GET /api/auth/me
   * Lấy thông tin của người dùng đang đăng nhập.
   * Yêu cầu JWT token hợp lệ trong header.
   */
  async me(ctx) {
    try {
      const userId = ctx.state.user.id;
      if (!userId) {
        return ctx.unauthorized('Bạn cần đăng nhập để xem thông tin này.');
      }

      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        populate: ['categories', 'avatar'], // Thêm avatar vào populate
      });

      if (!user) {
        return ctx.notFound('Không tìm thấy người dùng.');
      }

      ctx.body = {
        id: user.id,
        username: user.username,
        email: user.email,
        categories: user.categories.map(category => ({
          id: category.id,
          name: category.name,
        })),
        avatar: user.avatar,
      };

    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      ctx.internalServerError('Lỗi khi lấy thông tin người dùng.');
    }
  },
};
