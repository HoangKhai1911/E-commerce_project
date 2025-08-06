'use strict';
import * as jwt from 'jsonwebtoken';

/**
 * Custom auth controller
 */
export default {
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
    let { identifier, password } = ctx.request.body;

    const adminCode = process.env.ADMIN_CODE;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'; // Mặc định là 'admin' nếu không được đặt

    // --- Logic đăng nhập đặc biệt cho Admin ---
    // Khi mã đặc biệt được sử dụng, chúng ta sẽ tìm người dùng có quyền admin.
    if (adminCode && identifier === adminCode) {
      try {
        // Tìm người dùng admin cụ thể bằng username và đảm bảo họ có cờ isAdmin.
        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            username: adminUsername,
            isAdmin: true, // Sử dụng trường isAdmin bạn đã thêm
          },
          populate: ['role'],
        });

        if (!user) {
          return ctx.unauthorized('Tài khoản Admin không hợp lệ hoặc không được cấu hình đúng.');
        }

        // **Quan trọng**: Xác thực mật khẩu được cung cấp với mật khẩu đã được mã hóa trong cơ sở dữ liệu.
        // Điều này an toàn hơn nhiều so với việc so sánh với một mật khẩu văn bản gốc trong file .env.
        const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);

        if (!validPassword) {
          return ctx.unauthorized('Tài khoản Admin không hợp lệ hoặc không được cấu hình đúng.');
        }

        // Đảm bảo tài khoản admin đã được xác nhận và không bị khóa
        if (!user.confirmed) {
          return ctx.unauthorized('Tài khoản Admin chưa được xác thực email.');
        }
        if (user.blocked) {
          return ctx.unauthorized('Tài khoản Admin đã bị khóa.');
        }

        // Cấp JWT và trả về thông tin người dùng
        const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });
        const userProfile = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
          populate: ['role', 'categories', 'avatar'],
        });

        const sanitizedUser = strapi.plugins['users-permissions'].services.user.sanitizeUser(userProfile);

        return ctx.send({ jwt, user: { ...sanitizedUser, isAdmin: userProfile.isAdmin } });
      } catch (error) {
        console.error('Lỗi khi đăng nhập Admin:', error);
        return ctx.internalServerError('Đăng nhập Admin không thành công. Vui lòng thử lại.');
      }
    }

    // Nếu không phải ADMIN_CODE thì tiếp tục đăng nhập như thường
    if (!identifier || !password) {
      return ctx.badRequest('Thiếu thông tin đăng nhập.');
    }

    try {
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [{ username: identifier }, { email: identifier }]
        }
      });

      if (!user) {
        return ctx.unauthorized('Tài khoản không tồn tại.');
      }

      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);

      if (!validPassword) {
        return ctx.unauthorized('Mật khẩu không chính xác.');
      }

      if (!user.confirmed) {
        return ctx.unauthorized('Tài khoản chưa được xác thực email.');
      }

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });

      const userProfile = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['role', 'categories', 'avatar'],
      });

      ctx.send({
        jwt,
        user: {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
          categories: (userProfile.categories || []).map((category) => ({
            id: category.id,
            name: category.name,
          })),
          avatar: userProfile.avatar,
          isAdmin: userProfile.isAdmin, // ✅ Thêm dòng này
        },
      });

    } catch (err) {
      console.error('Lỗi khi đăng nhập:', err);
      ctx.internalServerError('Đăng nhập không thành công.');
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
        populate: ['role', 'categories', 'avatar'], // Thêm role và avatar vào populate
      });

      if (!user) {
        return ctx.notFound('Không tìm thấy người dùng.');
      }

      ctx.body = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role, // Trả về thông tin role
        categories: user.categories.map(category => ({
          id: category.id,
          name: category.name,
        })),
        avatar: user.avatar,
        isAdmin: user.isAdmin, // QUAN TRỌNG: Thêm trường isAdmin
      };

    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      ctx.internalServerError('Lỗi khi lấy thông tin người dùng.');
    }
  },

  /**
   * GET /api/auth/verify-email
   * Xác minh email của người dùng.
   */
  async verifyEmail(ctx) {
    const { token } = ctx.query;

    if (!token) {
      return ctx.badRequest('Thiếu token xác minh.');
    }

    try {
      // Xác minh JWT token
      const payload: any = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
      const userId = payload.id;

      if (!userId) {
        throw new Error('Token không hợp lệ.');
      }

      // Cập nhật trạng thái 'confirmed' của người dùng thành true
      await strapi.plugins['users-permissions'].services.user.edit(userId, {
        confirmed: true,
      });

      // TODO: Chuyển hướng người dùng đến trang đăng nhập hoặc trang thông báo thành công trên frontend
      // Ví dụ: return ctx.redirect('http://your-frontend-url/login?verified=true');
      ctx.body = {
        message: 'Xác minh email thành công. Bây giờ bạn có thể đăng nhập.',
      };
    } catch (error) {
      console.error('Lỗi khi xác minh email:', error);
      if (error.name === 'TokenExpiredError') {
        return ctx.badRequest('Token xác minh đã hết hạn.');
      }
      if (error.name === 'JsonWebTokenError') {
        return ctx.badRequest('Token xác minh không hợp lệ.');
      }
      ctx.internalServerError('Xác minh email không thành công.');
    }
  },
};
