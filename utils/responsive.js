import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device (iPhone X/11)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales a dimension based on the screen width relative to the base width.
 * Good for widths, margins, paddings, and icons.
 */
const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales a dimension based on the screen height relative to the base height.
 * Good for heights.
 */
const verticalScale = (size) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Scaling with a moderation factor. 
 * Good for font sizes and elements that should only scale slightly on larger screens.
 * @param {number} size - Original size
 * @param {number} factor - Moderation factor (default 0.5)
 */
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Device categories for conditional layout logic
const isSmallMobile = SCREEN_WIDTH < 360;
const isMediumMobile = SCREEN_WIDTH >= 360 && SCREEN_WIDTH <= 414;
const isLargeMobile = SCREEN_WIDTH > 414;

export {
  scale,
  verticalScale,
  moderateScale,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  isSmallMobile,
  isMediumMobile,
  isLargeMobile
};
