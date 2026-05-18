module.exports = {
  apps: [
    {
      name: "s3d",
      script: "npm",
      args: "start",
      env_file: ".env",
      env_production: {
        NODE_ENV: "production",
        PORT: 3010,
        NEXTAUTH_URL: "https://studio3d.sie.com.ar",
        NEXTAUTH_SECRET: "jddRfoAdsQJYNvnGQ/KlXtoINY0Yc/Ab0MYgdg5J2IQ="
      }
    }
  ]
};
