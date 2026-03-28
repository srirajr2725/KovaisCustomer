// import React, { useState } from 'react';
// import { useNavigation } from '@react-navigation/native';

// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import Hotels from './Hotels';

// export default function BookNow({ route, goBack  }) {
//   const { roomType: passedRoomType, date: passedDate } = route?.params || {};
//  const navigation = useNavigation();  
//   const [name, setName] = useState('');
//   const [date, setDate] = useState(passedDate || '');
//   const [roomType, setRoomType] = useState(passedRoomType || '');
//   const [showHotelsScreen, setShowHotelsScreen] = useState(false); // ✅ properly defined state

//   const handleBooking = () => {
//     if (!name.trim() || !date.trim() || !roomType.trim()) {
//       Alert.alert('Missing Fields', 'Please fill out all fields before confirming.');
//       return;
//     }

//     Alert.alert(
//       'Booking Confirmed',
//       `Thank you, ${name}! Your booking for a ${roomType} on ${date} is confirmed.`
//     );

//     setName('');
//     setDate('');
//     setRoomType('');
//   };

//   const handleGoBack = () => {
//     setShowHotelsScreen(true); // ✅ go back to Hotels component
//   };

//   if (showHotelsScreen) {
//     return <Hotels />; // ✅ conditional render
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Book Your Room</Text>

//       <TextInput
//         placeholder="Your Name"
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         placeholder="Booking Date (YYYY-MM-DD)"
//         style={styles.input}
//         value={date}
//         onChangeText={setDate}
//       />

//       <TextInput
//         placeholder="Room Type (e.g., Deluxe Room)"
//         style={styles.input}
//         value={roomType}
//         onChangeText={setRoomType}
//       />

//       <View style={styles.buttonWrapper}>
//         <Button title="Confirm Booking" onPress={handleBooking} color="#2563eb" />
//       </View>

//       <View>
//       <TouchableOpacity onPress={goBack}>
//         <Text>Go Back</Text>
//       </TouchableOpacity>
//     </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     paddingTop: 40,
//     backgroundColor: '#fff',
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     marginBottom: 24,
//     color: '#111',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   buttonWrapper: {
//     marginVertical: 10,
//   },
//   backButton: {
//     marginTop: 20,
//     alignSelf: 'center',
//     padding: 10,
//   },
//   backText: {
//     fontSize: 16,
//     color: '#1e40af',
//   },
// });
