 import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatListItem({ chat }: { chat: any }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push({ pathname: '/chat/[chatId]', params: { chatId: chat.id } })}
    >
      {/* Avatar */}
      <Image
        source={{ uri: chat.avatar || 'https://placekitten.com/200/200' }}
        style={styles.avatar}
      />

      {/* Center section: Name + Last message */}
      <View style={styles.middle}>
        <Text style={styles.name}>{chat.name}</Text>

        <Text numberOfLines={1} style={styles.lastMessage}>
          {chat.lastMessage}
        </Text>
      </View>

      {/* Right section: Time + unread badge */}
      <View style={styles.right}>
        <Text style={styles.time}>{chat.time || '12:00'}</Text>

        {chat.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
container: {
  flexDirection: 'row',
  paddingVertical: 12,
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#0B141A',
  borderBottomWidth: 1,
  borderBottomColor: '#222E35',
},

name: { color: '#E9EDF0' },
lastMessage: { color: '#8696A0' },
time: { color: '#00A884' },


  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 14,
  },

  middle: {
    flex: 1,
    justifyContent: 'center',
  },

 

  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 10,
  },



  unreadBadge: {
    minWidth: 22,
    height: 22,
    backgroundColor: '#25D366',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  unreadText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
