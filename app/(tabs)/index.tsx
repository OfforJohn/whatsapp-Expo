import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Modal } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ChatListItem from "@/components/ChatListItem";

import { GET_INITIAL_CONTACTS_ROUTE, HOST } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/components/utils/authStore";


interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}


export default function ChatsScreen() {
  const [chats, setChats] = useState<ChatItem[]>([]);

  const [showMenu, setShowMenu] = useState(false);


  const userId = 1; // logged-in user ID (replace when auth is done)

  const logOut = useAuthStore((state) => state.logOut);









  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userId}`);

   const mappedChats: ChatItem[] = data.users.map((item: any) => ({
  id: String(item.id),
  name: item.name,
  lastMessage: item.message,
 time: new Date(item.createdAt).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
}),

  unread: item.totalUnreadMessages,
  avatar: item.profilePicture && item.profilePicture.startsWith("http")
    ? item.profilePicture
    : `https://i.pravatar.cc/150?u=${item.id}`
}));



        setChats(mappedChats);
      } catch (error) {
        console.log("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Chats</Text>

        <View style={styles.headerIcons}>
          <Ionicons name="camera-outline" size={23} color="#fff" style={{ marginRight: 20 }} />
          <Pressable onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={23} color="#fff" />
          </Pressable>

        </View>


      </View>


      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.modalBox}>
            <Pressable
              style={styles.logoutButton}
              onPress={async () => {
                try {
                  await logOut();
                  setShowMenu(false);
                } catch (err) {
                  console.error("Logout failed", err);
                }
              }}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>



          </View>
        </Pressable>
      </Modal>



      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput placeholder="Search..." placeholderTextColor="#777" style={styles.searchInput} />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsRow}>
        {["All", "Unread", "Favorites", "Groups"].map((chip, i) => (
          <Pressable key={i} style={[styles.chip, i === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{chip}</Text>
          </Pressable>
        ))}
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={({ item }) => <ChatListItem chat={item} />}
        keyExtractor={(item) => item.id}
      />

      {/* Floating Button */}
      <Pressable style={styles.fab}>
        <MaterialCommunityIcons name="message-plus" color="#2b2626ff" size={28} />
      </Pressable>
    </View>
  );


}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B141A", paddingHorizontal: 10 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 10,
  },

  modalBox: {
    backgroundColor: "#1C252C",
    borderRadius: 8,
    paddingVertical: 12,
    width: 160,
    elevation: 10,
  },

  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  logoutText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "600",
  },


  /** HEADER **/
  headerRow: {
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E9EDF0",
  },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  /** SEARCH **/
  searchContainer: {
    backgroundColor: "#202C33",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  searchInput: { marginLeft: 10, color: "#fff", flex: 1 },

  /** FILTERS **/
  chipsRow: {
    flexDirection: "row",
    marginTop: 15,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#1C252C",
    borderRadius: 20,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: "#005C4B",
  },
  chipText: {
    color: "#B8C4CC",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  /** FAB **/
  fab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#00A884",
    padding: 18,
    borderRadius: 30,
    elevation: 10,
  },
});
