/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AMPLIFY_ACCESS_KEY_ID: process.env.AMPLIFY_ACCESS_KEY_ID,
    AMPLIFY_SECRET_ACCESS_KEY: process.env.AMPLIFY_SECRET_ACCESS_KEY,
    AMPLIFY_AWS_REGION: process.env.AMPLIFY_AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
  },
}

module.exports = nextConfig
