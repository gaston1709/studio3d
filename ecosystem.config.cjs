module.exports = {
  apps: [
    {
      name: "s3d",
      script: "npm",
      args: "start",
      env_production: {
        NODE_ENV: "production",
        PORT: 3010
      }
    }
  ]
};
