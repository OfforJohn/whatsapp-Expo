import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  Image,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

import MessageBubble from "@/components/MessageBubble";
import MessageBar from "@/components/MessageBar";
import { GET_MESSAGES_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { useAuthStore } from "@/components/utils/authStore";

// helper
const toStringParam = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v ?? "";

export default function ChatScreen() {
  const params = useLocalSearchParams();

  const chatPartnerIdRaw = toStringParam(params.chatId);
  const chatName = toStringParam(params.chatName);
  const chatAvatar = toStringParam(params.chatAvatar);

  const currentUserIdRaw = useAuthStore((s) => s.backendId)?.toString();



  // -------------------------------------
  // 🛑 Protect against missing IDs
  // -------------------------------------
  if (!currentUserIdRaw || !chatPartnerIdRaw) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 30 }}>
          Loading chat...
        </Text>
      </SafeAreaView>
    );
  }

  // Convert to numbers (safe)
  const currentUserId = Number(currentUserIdRaw);
  const chatPartnerId = Number(chatPartnerIdRaw);

  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList<any>>(null);
  const router = useRouter();

  // -------------------------------------
  // Fetch Messages
  // -------------------------------------
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        `${GET_MESSAGES_ROUTE}/${currentUserId}/${chatPartnerId}`
      );

      console.log("Fetched messages:", data.messages);

      setMessages(data.messages.reverse());
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------
  // Send Message
  // -------------------------------------
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      await axios.post(ADD_MESSAGE_ROUTE, {
        message: text,
        from: currentUserId,
        to: chatPartnerId,
      });

      fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Image source={{ uri: chatAvatar }} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{chatName}</Text>
          <Text style={styles.status}>online</Text>
        </View>

        <Pressable style={{ marginHorizontal: 8 }}>
          <Ionicons name="call" size={24} color="#fff" />
        </Pressable>
        <Pressable>
          <MaterialIcons name="videocam" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Chat Body */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          renderItem={({ item }) => (
            <MessageBubble message={item} currentUserId={currentUserId} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 10 }}
        />

        <View style={styles.inputWrapper}>
          <MessageBar onSend={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111B21",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#202C33",
    elevation: 4,
    paddingTop: 30,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginHorizontal: 10,
  },

  name: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  status: {
    color: "#8696A0",
    fontSize: 13,
  },

  inputWrapper: {
    backgroundColor: "#111B21",
    paddingBottom: Platform.OS === "ios" ? 12 : 6,
  },
});
