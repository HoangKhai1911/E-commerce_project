export default ({ env }) => ({
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: 'noreply@yourdomain.com',
      defaultReplyTo: 'noreply@yourdomain.com',
    },
  },
});