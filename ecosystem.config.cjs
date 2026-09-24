module.exports = {
  apps: [
    {
      name: "otl",
      script: "npm",
      args: "run start -- -H 0.0.0.0 -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
