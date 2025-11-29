/**
 * Metro config for Expo + NativeWind + SVG transformer + Better Auth
 *
 * This version includes:
 * - Better Auth package export resolution (CRITICAL for session persistence)
 * - SVG transformer for react-native-svg
 * - NativeWind CSS support
 */

const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const defaultConfig = getDefaultConfig(__dirname) || {}

// Defensive extraction: handle varying shapes across Expo versions
const resolverConfig = defaultConfig.resolver || {}
const transformerConfig = defaultConfig.transformer || {}

const assetExts = Array.isArray(resolverConfig.assetExts)
  ? resolverConfig.assetExts.slice()
  : []
const sourceExts = Array.isArray(resolverConfig.sourceExts)
  ? resolverConfig.sourceExts.slice()
  : []

// Remove svg from assetExts (if present) and ensure it's in sourceExts
const filteredAssetExts = assetExts.filter((ext) => ext !== 'svg')
const finalSourceExts = Array.from(new Set([...sourceExts, 'svg']))

const config = {
  ...defaultConfig,
  transformer: {
    // Keep any existing transformer settings but ensure babelTransformerPath is set
    ...transformerConfig,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...resolverConfig,
    assetExts: filteredAssetExts,
    sourceExts: finalSourceExts,
    // CRITICAL: Enable package exports resolution for Better Auth
    // This allows Better Auth to properly resolve its module exports
    // which is required for session storage to work correctly
    unstable_enablePackageExports: true,
  },
}

// Export wrapped with NativeWind so your Tailwind CSS setup remains enabled
module.exports = withNativeWind(config, { input: './styles/global.css' })
