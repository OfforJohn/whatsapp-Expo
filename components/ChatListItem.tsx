import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ChatListItem({ chat }: { chat: any }) {
  const router = useRouter();

  // Debug log

  const handleOpenChat = () => {
    if (!chat || !chat.id) {
      console.error("❌ ChatListItem error: chat.id missing!", chat);
      return;
    }

    router.push({
      pathname: "/chat/[chatId]",
      params: {
        chatId: chat.id.toString(), // ensure string
        chatName: chat.name || "Unknown",
        chatAvatar: chat.avatar || "",
      },
    });

    console.log("ChatListItem - navigating with params:", {
      chatId: chat.id,
      chatName: chat.name,
      chatAvatar: chat.avatar,
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleOpenChat}>
      {/* Avatar */}
      <Image
        source={{ uri: chat.avatar || "https://i.ibb.co/CJg5v0F/default-avatar.png" }}
        style={styles.avatar}
      />

      {/* Middle section */}
      <View style={styles.middle}>
        <Text style={styles.name}>{chat.name}</Text>
        <Text numberOfLines={1} style={styles.lastMessage}>
          {chat.lastMessage || "No messages yet"}
        </Text>
      </View>

      {/* Right section */}
      <View style={styles.right}>
        <Text style={styles.time}>{chat.time || ""}</Text>

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
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#0B141A",
    borderBottomWidth: 1,
    borderBottomColor: "#222E35",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 14,
  },

  middle: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    color: "#E9EDF0",
    fontWeight: "600",
    fontSize: 16,
  },

  lastMessage: {
    color: "#8696A0",
    fontSize: 13,
    marginTop: 2,
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },

  time: {
    color: "#00A884",
    fontSize: 12,
    marginBottom: 4,
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    backgroundColor: "#25D366",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  unreadText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
