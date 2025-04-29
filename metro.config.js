const { getDefaultConfig } = require('expo/metro-config');

module.exports = async () => {
  const config = await getDefaultConfig(__dirname);

  // Garantir que resolver.blockList seja um array antes de usar o spread operator
  config.resolver.blockList = Array.isArray(config.resolver.blockList)
    ? [...config.resolver.blockList, /axios\/dist\/node\/axios\.cjs$/]
    : [/axios\/dist\/node\/axios\.cjs$/];

  // Adicionar suporte para extensões .cjs (opcional, mas pode ajudar)
  config.resolver.assetExts = [...config.resolver.assetExts, 'cjs'];

  return config;
};