'use strict';

/**
 * `is-admin` policy.
 */

export default (policyContext, config, { strapi }) => {
  // policyContext.state.user chứa thông tin người dùng được lấy từ JWT token
  // Chúng ta kiểm tra xem người dùng có tồn tại và có cờ isAdmin hay không.
  if (policyContext.state.user?.isAdmin) {
    // Nếu là admin, cho phép request được tiếp tục.
    return true;
  }

  // Nếu không phải admin, từ chối truy cập (sẽ trả về lỗi 403 Forbidden).
  return false;
};
