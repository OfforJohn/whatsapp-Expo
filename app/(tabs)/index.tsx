import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Modal } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ChatListItem from "@/components/ChatListItem";

import { GET_ALL_CONTACTS, GET_INITIAL_CONTACTS_ROUTE, HOST } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/components/utils/authStore";
import ContactsScreen from "./ContactsScreen";


interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface Contact {
  id: number;
  email: string;
  name: string;
  profilePicture: string;
  about: string;
}



export default function ChatsScreen() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsData, setContactsData] = useState<{ [key: string]: Contact[] }>({});

  const backendId = useAuthStore((state) => state.backendId);
  const authLoaded = useAuthStore((state) => state.authLoaded);
  const logOut = useAuthStore((state) => state.logOut);



  
  // Fetch contacts grouped by letter from backend (your endpoint)
  useEffect(() => {
    if (!authLoaded || !backendId) return;

    const fetchContacts = async () => {
      try {
        const { data } = await axios.get(`${GET_ALL_CONTACTS}`);
        // Expecting data.users to be grouped object { "A": [...], "B": [...] }
        setContactsData(data.users);

      
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };

    fetchContacts();
  }, [authLoaded, backendId]);




  useEffect(() => {
    if (!authLoaded) return;             // Wait until Zustand is restored
    if (!backendId) {
      console.log("⚠️ No backendId available, cannot fetch chats");
      return;
    }

    const fetchChats = async () => {
      try {
        console.log("📡 Fetching chats for backend ID:", backendId);

        const { data } = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${backendId}`
        );


        const mappedChats: ChatItem[] = data.users.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          lastMessage: item.message,
          time: (() => {
            const date = new Date(item.createdAt);
            let hours = date.getHours() % 12;
            if (hours === 0) hours = 12; // convert 0 to 12
            const minutes = date.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
          })(),

          unread: item.totalUnreadMessages,
          avatar:
            item.profilePicture && item.profilePicture.startsWith("http")
              ? item.profilePicture
              : `https://i.pravatar.cc/150?u=${item.id}`,
        }));

        setChats(mappedChats);
      } catch (error) {
        console.log("❌ Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [authLoaded, backendId]); // 🔥 re-fetch when auth is ready and backendId exists



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Chats</Text>

        <View style={styles.headerIcons}>
          <Ionicons name="folder" size={23} color="#fff" style={{ marginRight: 20 }} 
          
            onPress={() => setShowContactsModal(true)} // Open contacts modal here
          />
          
          <Pressable onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={23} color="#fff" />
          </Pressable>

        </View>


      </View>

{/* Contacts Modal */}
<Modal visible={showContactsModal} animationType="slide">
  <View style={{ flex: 1, backgroundColor: "#0B141A" }}>

    {/* --- Modal Header (Close Button) --- */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingTop: 45,
        paddingBottom: 10,
        backgroundColor: "#0B141A",
        borderBottomColor: "#1f2c34",
        borderBottomWidth: 1,
        zIndex: 10,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
        Contacts
      </Text>

      <Pressable
        onPress={() => setShowContactsModal(false)}
        style={{
          backgroundColor: "#25D366",
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
          Go back
        </Text>
      </Pressable>
    </View>

    {/* --- Contacts Screen Content --- */}
    <ContactsScreen
      contactsData={contactsData}
      onClose={() => setShowContactsModal(false)}
    />
  </View>
</Modal>



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

      {/* Floating Button   
      <Pressable style={styles.fab}>
        <MaterialCommunityIcons name="message-plus" color="#2b2626ff" size={28} />
      </Pressable>

      */}
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
