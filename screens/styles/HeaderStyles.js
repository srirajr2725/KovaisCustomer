import { StyleSheet, Platform } from 'react-native';

const headerStyles = StyleSheet.create({
  headerWrapper: {
    height: Platform.OS === 'ios' ? 70 : 75,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 20 : 25,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -25,
    justifyContent: 'space-between',
    width: '100%',
  },
  logoContainer: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120, 
    height: 65,
  },
  menuButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default headerStyles;
