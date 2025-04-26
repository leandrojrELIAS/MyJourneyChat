const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar extensões de arquivo que o Metro deve reconhecer
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png',
  'jpg',
  'jpeg',
  'gif',
  'ttf',
  'otf',
];

// Inicializar o blockList como um array e adicionar a pasta mz para ser ignorada
config.resolver.blockList = [
  /(node_modules[\/\\]mz)/, // Ignorar a pasta node_modules/mz
];

// Aumentar o tempo limite para processamento de assets
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      req.setTimeout(30000); // Aumentar o tempo limite para 30 segundos
      return middleware(req, res, next);
    };
  },
};

module.exports = config;