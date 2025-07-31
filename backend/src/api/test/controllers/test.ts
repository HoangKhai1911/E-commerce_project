'use strict';

import { Context } from 'koa';

export default {
  async sendTestEmail(ctx: Context) {
    try {
      await strapi.plugin('email').service('email').send({
        to: 'khai38558@gmail.com',
        subject: '🧪 Email test từ Strapi',
        html: `<h1>Chào Khai!</h1><p>Email này được gửi từ hệ thống Strapi qua SendGrid 💌</p>`,
      });

      ctx.send({ message: 'Gửi thành công rồi nè!' });
    } catch (err) {
      ctx.send({ error: 'Không gửi được 😢', details: err });
    }
  },
};