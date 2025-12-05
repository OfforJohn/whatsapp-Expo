import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function StatusScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>My Status</Text>

      <View style={styles.myStatusContainer}>
        <Image
          source={{ uri: 'https://placekitten.com/200/200' }} 
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.title}>My Status</Text>
          <Text style={styles.subtitle}>Tap to add status update</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Updates</Text>

      <View style={styles.statusItem}>
        <Image
          source={{ uri: 'https://placekitten.com/220/220' }}
          style={styles.statusImage}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>John Doe</Text>
          <Text style={styles.subtitle}>5 minutes ago</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginVertical: 12, color: '#555' },
  myStatusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statusItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  statusImage: { width: 55, height: 55, borderRadius: 27.5 },
  title: { fontSize: 16, fontWeight: '500' },
  subtitle: { color: '#777', marginTop: 2 }
});
