import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const headerStyles = StyleSheet.create({
  headerWrapper: {
    height: Platform.OS === 'ios' ? verticalScale(70) : verticalScale(75),
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(15),
    paddingHorizontal: scale(16),
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -35,
    paddingTop: Platform.OS === 'ios' ? verticalScale(10) : moderateScale(25),
    justifyContent: 'space-between',
    width: '100%',
  },
  logoContainer: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: scale(120),
    height: verticalScale(65),
  },
  menuButtonContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default headerStyles;
