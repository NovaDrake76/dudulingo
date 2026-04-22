// Metro bundler config.
// Needed on web because expo-sqlite ships a `.wasm` binary and wa-sqlite
// uses SharedArrayBuffer, which requires cross-origin isolation headers.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.server = config.server || {};
const prevEnhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const wrapped = (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return middleware(req, res, next);
  };
  return prevEnhance ? prevEnhance(wrapped, server) : wrapped;
};

module.exports = config;
