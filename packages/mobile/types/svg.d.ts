/**
 * SVG Module Type Declarations
 *
 * Enables TypeScript to understand SVG imports when using react-native-svg-transformer.
 * SVG files are transformed into React components with SvgProps.
 */
declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps>
  export default content
}
