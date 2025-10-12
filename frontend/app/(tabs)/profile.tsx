import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { logout } from '../../services/auth';

const mockUser = {
  name: 'Dudu',
  photoUrl: require('../../assets/images/dudulingo.png'),
};

export default function Profile() {
  const handleLogout = async () => {
    await logout();
    router.replace('/auth/sign-in');
  };

  return (
    <View style={styles.container}>
      <Image source={mockUser.photoUrl} style={styles.avatar} />
      <Text style={styles.name}>{mockUser.name}</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#EA4335',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});