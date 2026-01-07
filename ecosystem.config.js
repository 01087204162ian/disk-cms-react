module.exports = {
  apps: [
    {
      name: "disk-cms-react",
      cwd: "/home/simg/disk-cms-react",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3001"
      }
    }
  ]
};
