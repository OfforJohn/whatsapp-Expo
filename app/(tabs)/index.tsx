import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import ChatListItem from "@/components/ChatListItem";

import {
  GET_ALL_CONTACTS,
  GET_INITIAL_CONTACTS_ROUTE,
} from "@/utils/ApiRoutes";

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/components/utils/authStore";
import ContactsScreen from "./ContactsScreen";

import * as DocumentPicker from "expo-document-picker";

import * as FileSystem from "expo-file-system/legacy";

import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useBotStore } from "../utils/botStore";
import { reducerCases } from "@/src/context/constants";
import { useStateProvider } from "@/src/context/StateContext";




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
  const [contactsData, setContactsData] = useState<{ [key: string]: Contact[] }>(
    {}
  );

  const backendId = useAuthStore((state) => state.backendId);
  const authLoaded = useAuthStore((state) => state.authLoaded);
  const logOut = useAuthStore((state) => state.logOut);

  const [isBroadcastModalVisible, setIsBroadcastModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);

  const refreshChats = useAuthStore((state) => state.refreshChats);
  const setRefreshChats = useAuthStore((state) => state.setRefreshChats);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewNumbers, setPreviewNumbers] = useState<
    { email: string; name: string; phoneNumber: string; profilePicture: string; about: string }[]
  >([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const [{ userInfo }, dispatch] = useStateProvider();

  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Add this line





  // inside component:





  // inside ChatsScreen component
  const botCount = useBotStore((state) => state.botCount);
  const delays = useBotStore((state) => state.delays);
  const setBotCount = useBotStore((state) => state.setBotCount);
  const setDelay = useBotStore((state) => state.setDelay);
  const loadBotStore = useBotStore((state) => state.loadFromStorage);


  useEffect(() => {
    loadBotStore();
  }, []);

  const refetchContacts = async () => {
    if (!authLoaded || !backendId) return;

    try {
      const { data } = await axios.get(
        `${GET_INITIAL_CONTACTS_ROUTE}/${backendId}`
      );

      dispatch({
        type: reducerCases.SET_USER_CONTACTS,
        userContacts: data.users ?? [],
      });

      dispatch({
        type: reducerCases.SET_ONLINE_USERS,
        onlineUsers: data.onlineUsers ?? [],
      });
    } catch (err) {
      console.error("❌ Failed to refresh contacts:", err);
    }
  };




  /* ---------------------- GENERATE DEFAULT CONTACTS (100) ---------------------- */
  const generateDefaultContacts = () => {
    const totalContacts = 10;
    const contacts = Array.from({ length: totalContacts }, (_, i) => ({
      email: `bot${i + 1}@fake.com`,
      name: `User ${i + 1}`,
      phoneNumber: `+100000${1000 + i}`,
      profilePicture: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      about: "",
      firebaseUid: `fake-uid-default-${Date.now()}-${i}`, // ADD THIS
    }));


    setPreviewNumbers(contacts);
    setIsPreviewVisible(true);
  };

  /* --------------------------- CONFIRM IMPORT --------------------------- */
  const confirmImportNumbers = async () => {
    try {
      const payload = previewNumbers.map((item, index) => ({
        email: item.email,
        name: item.name,
        phoneNumber: item.phoneNumber,
        profilePicture: item.profilePicture,
        about: "",
        firebaseUid: `fake-uid-${Date.now()}-${index}`,
      }));

      const response = await axios.post(
        "https://render-backend-ksnp.onrender.com/api/auth/add-batch-users",
        {
          startingId: 3,
          contacts: payload,
        }
      );

      // ✅ Success toast
      Toast.show({
        type: "success",
        text1: "Import Successful",
        text2: `${response.data.created} contacts added 🎉`,
      });

      // ✅ REFRESH CONTACTS + CHATS
      setRefreshChats(true);          // triggers chat refetch useEffect

      // ✅ Reset UI
      setIsPreviewVisible(false);
      setPreviewNumbers([]);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: "Import Failed",
          text2: error.response?.data?.error || "Something went wrong",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unexpected error occurred",
        });
      }
    }
  };




 const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

const handleBroadcastToAll = async () => {
  if (sending) return;

  if (!broadcastMessage.trim()) {
    Toast.show({ type: "error", text1: "Error", text2: "Please enter a message" });
    return;
  }

  if (!backendId) {
    Toast.show({ type: "error", text1: "Error", text2: "Backend user not found" });
    return;
  }


  
  // ✅ Close modal immediately
  setIsBroadcastModalVisible(false);

  try {
    setSending(true);

    // ✅ Start polling immediately
    let pollCount = 0;
    const pollInterval = 5000; // adjust if needed
    const maxPollCount = 1000; // arbitrary large number to allow long polling
    pollIntervalRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${backendId}`);
        const mappedChats = data.users.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          lastMessage: item.message,
          time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: item.totalUnreadMessages,
          avatar:
            item.profilePicture && item.profilePicture.startsWith("http")
              ? item.profilePicture
              : `https://i.pravatar.cc/150?u=${item.id}`,
        }));
        setChats(mappedChats);
      } catch (err) {
        console.error("Polling error:", err);
      }
      pollCount++;
      if (pollCount >= maxPollCount) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
      }
    }, pollInterval);

    // Prepare bot delays
    const botDelaysInMilliseconds = Array.from({ length: botCount }, (_, i) => {
      const delaySec = delays[i] || 0;
      return delaySec * 1000;
    });

    // Send broadcast
    await axios.post("https://render-backend-ksnp.onrender.com/api/auth/message/broadcast", {
      message: broadcastMessage,
      senderId: backendId,
      botCount,
      botDelays: botDelaysInMilliseconds,
    });

    // ✅ Show success toast
    Toast.show({
      type: "success",
      text1: "Broadcast sent",
      text2: "Messages are being delivered according to bot delays",
    });

    // ✅ Stop polling 5 seconds after toast
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        console.log("🛑 Polling stopped 5s after broadcast success");
      }
    }, 7000);

    setBroadcastMessage("");

  } catch (err) {
    console.error("Broadcast error:", err);
    Toast.show({ type: "error", text1: "Error", text2: "Failed to send broadcast" });
  } finally {
    setSending(false);
  }
};


  /* --------------------------- FETCH CONTACTS --------------------------- */
  useEffect(() => {
    if (!authLoaded || !backendId) return;

    const fetchContacts = async () => {
      try {
        const { data } = await axios.get(`${GET_ALL_CONTACTS}`);
        setContactsData(data.users);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };

    fetchContacts();

  }, [authLoaded, backendId]);


  const firebaseUid = useAuthStore((state) => state.userId);

  const handleDeleteUsers = async () => {
    if (!firebaseUid) {
      Toast.show({
        type: "error",
        text1: "Auth error",
        text2: "Please log in again",
      });
      return;
    }

    try {
      const startId = 3;

      const response = await axios.delete(
        `https://render-backend-ksnp.onrender.com/api/auth/delete-batch-users/${startId}`,
        {
          headers: {
            "x-firebase-uid": firebaseUid,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Contacts deleted",
        text2: `${response.data.deletedCount} users removed.`,
      });

      // ✅ FORCE REFRESH AFTER DELETE
      setRefreshChats(true);     // trigger chats re-fetch
      
      setShowDeleteConfirmation(false); // Close the modal after deletion

    } catch (error) {
      if (axios.isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: error.response?.data?.message || "Something went wrong",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Unexpected Error",
          text2: "Something went wrong",
        });
      }
    }
  };







  /* ----------------------------- CSV PICKER ----------------------------- */

  const pickCSVFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });

      if (result.canceled) return;

      const file = result.assets[0];

      const csvContent = await FileSystem.readAsStringAsync(file.uri);

      parseCSV(csvContent);
      setShowImportModal(false);
    } catch (err) {
    }
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split("\n");

    const contacts = lines.slice(1).map((line, index) => {
      const [name, phoneNumber] = line.split(",");

      return {
        email: `bot${index + 1}@fake.com`,
        name: name?.trim(),
        phoneNumber: phoneNumber?.trim(),
        profilePicture: `https://i.pravatar.cc/150?u=${index + 1}`,
        about: "",
        firebaseUid: `fake-uid-${Date.now()}-${index}`, // ✅ Add this
      };
    });

    setPreviewNumbers(contacts);
    setIsPreviewVisible(true);
  };

  /* ------------------------------ FETCH CHATS ------------------------------ */
  useEffect(() => {
    if (!authLoaded) return;
    if (!backendId) return;

    const fetchChats = async () => {
      try {
        const { data } = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${backendId}`
        );

        const mappedChats: ChatItem[] = data.users.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          lastMessage: item.message,
          lastMessageSenderId: item.senderId,      // ✅ REQUIRED
          lastMessageStatus: item.messageStatus,   // ✅ REQUIRED
          unread: item.totalUnreadMessages,
          time: (() => {
            const date = new Date(item.createdAt);
            let hours = date.getHours() % 12;
            if (hours === 0) hours = 12;
            const minutes = date.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
          })(),
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

  }, [authLoaded, backendId]);


  // WATCH REFRESH FLAG FOR CONTACTS
  useEffect(() => {
    if (refreshChats) {
      const fetchContacts = async () => {
        try {
          const { data } = await axios.get(`${GET_ALL_CONTACTS}`);
          setContactsData(data.users);
        } catch (err) {
          console.error("Failed to fetch contacts", err);
        }
      };
      fetchContacts();
      setRefreshChats(false);
    }
  }, [refreshChats]);

  // WATCH REFRESH FLAG FOR CHATS
  useEffect(() => {
    if (refreshChats && authLoaded && backendId) {
      const fetchChats = async () => {
        try {
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
              if (hours === 0) hours = 12;
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
      setRefreshChats(false);
    }
  }, [refreshChats, authLoaded, backendId]);






  /* ----------------------------- UI RENDERING ----------------------------- */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Chats</Text>

        <View style={styles.headerIcons}>
          <Ionicons
            name="folder"
            size={23}
            color="#fff"
            style={{ marginRight: 20 }}
            onPress={() => setShowContactsModal(true)}
          />

          <Pressable onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={23} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* CONTACTS MODAL */}
      <Modal visible={showContactsModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#0B141A" }}>
          <View style={styles.contactsHeader}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
              Contacts
            </Text>

            <Pressable
              onPress={() => setShowContactsModal(false)}
              style={styles.contactsCloseBtn}
            >
              <Text style={styles.contactsCloseText}>Go back</Text>
            </Pressable>
          </View>

          <ContactsScreen
            contactsData={contactsData}
            onClose={() => setShowContactsModal(false)}
          />
        </View>
      </Modal>

      {/* MENU MODAL */}
      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.modalBox}>
            {/* Import Contacts */}
            <Pressable
              style={styles.menuButton}
              onPress={() => {
                setShowMenu(false);
                setShowImportModal(true);
              }}
            >
              <Text style={styles.menuButtonText}>Import Contacts</Text>
            </Pressable>

            {/* Broadcast Message */}
            <Pressable
              style={styles.menuButton}
              onPress={() => {
                setIsBroadcastModalVisible(true);
                setShowMenu(false);
              }}
            >
              <Text style={styles.menuButtonTextS}>Broadcast Message</Text>
            </Pressable>

            {/* Delete Contacts */}
              <Pressable
              style={styles.menuButton}
              onPress={() => setShowDeleteConfirmation(true)} // Show confirmation modal
            >
              <Text style={styles.menuButtonDeleteText}>Delete Contacts</Text>



            </Pressable>
            <Pressable
              style={styles.menuButton}
              onPress={() => {
                setShowMenu(false);
                router.push("/settings");
              }}
            >
              <Text style={styles.menuSettings}>Settings</Text>
            </Pressable>



            {/* Log Out */}
            <Pressable
              style={styles.menuButton}
              onPress={async () => {
                await logOut();
                setShowMenu(false);
              }}
            >
              <Text style={styles.menuButtonLogoutText}>Log Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      
      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationText}>Are you sure you want to delete all contacts?</Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirmation(false)} // Close the confirmation modal
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={handleDeleteUsers} // Call the delete function
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast container */}
      <Toast />

      {/* IMPORT MODAL */}
      <Modal visible={showImportModal} transparent animationType="slide">
        <View style={styles.importOverlay}>
          <View style={styles.importBox}>
            <Text style={styles.importTitle}>Import Contacts</Text>
            <Text style={styles.importDesc}>
              Upload a CSV file or generate auto-filled contacts.
            </Text>

         <Pressable
  style={styles.csvButton}
  onPress={async () => {
    setShowImportModal(false); // close import modal immediately
    await pickCSVFile();       // then open picker and parse CSV
  }}
>
  <Text style={styles.csvButtonText}>Upload CSV File</Text>
</Pressable>


      <Pressable
  style={styles.defaultButton}
  onPress={() => {
    generateDefaultContacts(); // still prepares contacts
    setShowImportModal(false); // immediately close import modal
    setIsPreviewVisible(true); // optional: show preview if you want
  }}
>
  <Text style={styles.defaultButtonText}>Generate Default Contacts</Text>
</Pressable>


            <Pressable
              style={styles.closeButton}
              onPress={() => setShowImportModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* PREVIEW CONTACTS MODAL */}
      <Modal visible={isPreviewVisible} animationType="slide" transparent>
        <View style={styles.previewOverlay}>
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Preview Contacts</Text>
            <Text style={styles.previewSubtitle}>
              {previewNumbers.length} contacts ready to import.
            </Text>

            <FlatList
              data={previewNumbers}
              keyExtractor={(_, i) => i.toString()}
              style={{ maxHeight: 300, marginBottom: 15 }}
              renderItem={({ item }) => (
                <View style={styles.previewItem}>
                  <Text style={styles.previewName}>{item.name}</Text>
                  <Text style={styles.previewPhone}>{item.phoneNumber}</Text>
                </View>
              )}
            />

            <Pressable
              style={styles.confirmButton}
              onPress={confirmImportNumbers}
            >
              <Text style={styles.confirmText}>Import Contacts</Text>
            </Pressable>

            <Pressable
              style={styles.cancelPreviewButton}
              onPress={() => setIsPreviewVisible(false)}
            >
              <Text style={styles.cancelPreviewText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>


      {/* Broadcast Modal */}
      <Modal visible={isBroadcastModalVisible} transparent animationType="slide">
        <View style={styles.importOverlay}>
          <View style={styles.importBox}>
            <Text style={styles.importTitle}>Broadcast Message</Text>

            {/* Message Input */}
            <TextInput
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              placeholder="Type your message..."
              placeholderTextColor="#aaa"
              multiline
              style={{
                backgroundColor: "#0B141A",
                color: "#fff",
                padding: 10,
                borderRadius: 8,
                height: 100,
                marginVertical: 15,
              }}
            />








            {/* Send Button */}
            <Pressable
              style={[styles.confirmButton, { backgroundColor: sending ? "#555" : "#00A884" }]}
              onPress={handleBroadcastToAll}
              disabled={sending}
            >
              <Text style={styles.confirmText}>{sending ? "Sending..." : "Send Broadcast"}</Text>
            </Pressable>

            {/* Cancel */}
            <Pressable style={styles.closeButton} onPress={() => setIsBroadcastModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>






      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#777"
          style={styles.searchInput}
        />
      </View>

      {/* FILTERS */}
      <View style={styles.chipsRow}>
        {["All", "Unread", "Favorites", "Groups"].map((chip, i) => (
          <Pressable
            key={i}
            style={[styles.chip, i === 0 && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, i === 0 && styles.chipTextActive]}
            >
              {chip}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* CHAT LIST */}
      <FlatList
        data={chats}
        renderItem={({ item }) => <ChatListItem chat={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B141A", paddingHorizontal: 10 },

  /* HEADER */
  headerRow: {
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#E9EDF0" },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  /* CONTACTS MODAL */
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: "#0B141A",
    borderBottomColor: "#1f2c34",
    borderBottomWidth: 1,
  },




  menuButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  menuButtonTextS: {
    color: "#d9dedfff",
    fontSize: 16,
    fontWeight: "600",
  },
  menuButtonText: {
    color: "#d9dedfff",
    fontSize: 16,
    fontWeight: "600",
  },


   buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

   deleteButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

   confirmationBox: {
    backgroundColor: '#1C252C',
    padding: 20,
    borderRadius: 8,
    width: 300,
    alignItems: 'center',
  },
  confirmationText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },


  menuButtonDeleteText: {
    color: "#ff0000",
    fontSize: 16,
    fontWeight: "600",
  },
  menuButtonLogoutText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "600",
  },

  menuSettings: {
    color: "#fdfafaff",
    fontSize: 16,
    fontWeight: "600",
  },



  contactsCloseBtn: {
    backgroundColor: "#25D366",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  contactsCloseText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  /* MENU */
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
  },
  importButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  importText: {
    color: "#00cfff",
    fontSize: 16,
    fontWeight: "600",
  },
  importTextS: {
    color: "#ff0000ff",
    fontSize: 16,
    fontWeight: "600",
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

  /* IMPORT MODAL */
  importOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  importBox: {
    width: "85%",
    backgroundColor: "#1C252C",
    borderRadius: 12,
    padding: 20,
  },
  importTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 10,
  },
  importDesc: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
  },
  csvButton: {
    backgroundColor: "#00A884",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  csvButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  defaultButton: {
    backgroundColor: "#005C4B",
    padding: 12,
    borderRadius: 8,
  },
  defaultButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  /* PREVIEW MODAL */
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewBox: {
    width: "85%",
    backgroundColor: "#1C252C",
    padding: 20,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 5,
  },
  previewSubtitle: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 15,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  previewName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewPhone: {
    color: "#aaa",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#00A884",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelPreviewButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelPreviewText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  /* SEARCH */
  searchContainer: {
    backgroundColor: "#202C33",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  searchInput: {
    marginLeft: 10,
    color: "#fff",
    flex: 1,
  },

  /* FILTERS */
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
});
