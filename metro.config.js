// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

// Optional custom assets
config.resolver.assetExts.push("db", "mp3", "ttf", "obj", "mtl", "webp");

// NativeWind
config = withNativeWind(config, { input: "./global.css" });

// Reanimated
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
