const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/jobportal",
    createProxyMiddleware({
      // I have a different port and Visual Studio might randomly change it
      // Fix: edit running configuration
      // https://stackoverflow.com/questions/70332897/how-to-change-default-port-no-of-my-net-core-6-api

      // Notice: no /api at the end of URL, it will be added.
      // more details at: https://www.npmjs.com/package/http-proxy-middleware
      target: "http://localhost:5000",
      changeOrigin: true,

      // Im using .net core 6 starting api template
      // which is running with a self-signed ssl cert with https enabled
      secure: false
    })
  );
};
