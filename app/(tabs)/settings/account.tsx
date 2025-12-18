// BotRepliesSettings.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useBotStore } from "@/app/utils/botStore";

/**
 * Notes:
 * - Fully uses botStore for botCount and delays
 * - AsyncStorage handled inside botStore
 * - Endpoints: GET /api/auth/get-replies, POST /api/auth/add-reply, PUT /api/auth/update-reply/:id, DELETE /api/auth/delete-reply/:id
 */

export default function BotRepliesSettings() {
  const [replyInput, setReplyInput] = useState("");
  const [replies, setReplies] = useState<{ id: string | number; content: string }[]>([]);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const botCount = useBotStore((state) => state.botCount);
  const setBotCount = useBotStore((state) => state.setBotCount);
  const delays = useBotStore((state) => state.delays);
  const setDelay = useBotStore((state) => state.setDelay);
  const resetDelays = useBotStore((state) => state.resetDelays);
  const loadFromStorage = useBotStore((state) => state.loadFromStorage);

  const BASE = "https://render-backend-ksnp.onrender.com";

  // Load bot settings from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Fetch replies
  const fetchReplies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE}/api/auth/get-replies`);
      const fetched = res.data?.replies ?? [];
      setReplies(fetched);

      // Initialize delays for new replies
      fetched.forEach((r: { id: string; }) => {
        if (!(r.id in delays)) setDelay(r.id, 0);
      });
    } catch (err) {
      console.error("Failed to fetch replies", err);
      setError("Failed to load replies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  // Add reply
  const handleAdd = async () => {
    if (!replyInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE}/api/auth/add-reply`, { content: replyInput });
      setMessage("✅ Reply added!");
      setReplyInput("");
      await fetchReplies();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add reply.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Delete reply
  const handleDelete = async (id: string | number) => {
    Alert.alert("Delete reply", "Are you sure you want to delete this reply?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          setError("");
          try {
            await axios.delete(`${BASE}/api/auth/delete-reply/${id}`);
            setDelay(id, 0); // reset delay in store
            await fetchReplies();
            setMessage("✅ Reply deleted");
          } catch (err) {
            console.error(err);
            setError("❌ Failed to delete reply.");
          } finally {
            setLoading(false);
            setTimeout(() => {
              setMessage("");
              setError("");
            }, 2000);
          }
        },
      },
    ]);
  };

  // Edit reply
  const handleEdit = async (id: string | number) => {
    if (!editContent.trim()) return;
    setLoading(true);
    setError("");
    try {
      await axios.put(`${BASE}/api/auth/update-reply/${id}`, { content: editContent });
      setEditId(null);
      setEditContent("");
      await fetchReplies();
      setMessage("✅ Reply updated");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update reply.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Reset all delays
  const handleResetAllDelays = async () => {
    resetDelays();
    setMessage("✅ All delays reset");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.title}>🤖 Manage Bot Replies</Text>
        </View>

        

        {/* Add input */}
        <View style={styles.row}>
          <TextInput
            placeholder="Enter new bot reply..."
            placeholderTextColor="#9ca3af"
            value={replyInput}
            onChangeText={setReplyInput}
            style={styles.input}
          />
          <Pressable style={[styles.btn, styles.addBtn]} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add</Text>}
          </Pressable>
        </View>

        {/* Bot count */}
        <View style={[styles.row, { alignItems: "center" }]}>
          <Text style={styles.label}>Number of Bot Replies to Use:</Text>
        <TextInput
  style={styles.smallInput}
  keyboardType="numeric"
  value={botCount === 0 ? "" : String(botCount)} // Show empty string if botCount is 0
  onChangeText={(v) => {
    const n = parseInt(v, 10);
    if (v === "" || (!Number.isNaN(n) && n > 0)) {
      setBotCount(v === "" ? 0 : n);  // Set to 0 if input is empty, otherwise valid number
    }
  }}
/>

          <Text style={styles.hint}>(Max: {replies.length})</Text>
        </View>

        {/* Reset button */}
        <View style={styles.actionRow}>
          <Pressable style={[styles.btn, styles.resetBtn]} onPress={handleResetAllDelays}>
            <Text style={styles.btnText}>🔄 Reset All Delays</Text>
          </Pressable>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

       <Text style={styles.sectionTitle}>📜 Existing Replies:</Text>

{loading && replies.length === 0 ? (
  <ActivityIndicator style={{ marginTop: 12 }} />
) : (
  replies.map((r, replyIndex) => (
    <View key={String(r.id)} style={styles.replyRow}>
      {editId === r.id ? (
        <>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={editContent}
            onChangeText={setEditContent}
            placeholder="Edit reply..."
          />
          <View style={styles.iconRow}>
            <Pressable onPress={() => handleEdit(r.id)} style={styles.iconBtn}>
              <MaterialIcons name="check" size={20} color="#16a34a" />
            </Pressable>
            <Pressable onPress={() => setEditId(null)} style={styles.iconBtn}>
              <MaterialIcons name="close" size={20} color="#6b7280" />
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.replyText}>{r.content}</Text>
          <View style={styles.controls}>
            <Pressable
              onPress={() => {
                setEditId(r.id);
                setEditContent(r.content);
              }}
              style={styles.iconBtn}
            >
              <MaterialIcons name="edit" size={20} color="#2563eb" />
            </Pressable>
            <Pressable onPress={() => handleDelete(r.id)} style={styles.iconBtn}>
              <MaterialIcons name="delete" size={20} color="#ef4444" />
            </Pressable>

            {/* Delay Input for this reply/bot */}
            <TextInput
              style={styles.delayInput}
              keyboardType="numeric"
              value={String(delays[replyIndex] ?? 0)} // <-- use reply index for bot delay
              onChangeText={(v) => setDelay(replyIndex, parseInt(v || "0", 10) || 0)}
              placeholder="Delay (sec)"
            />
          </View>
        </>
      )}
    </View>
  ))
)}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", marginLeft: 12, color: "#111827" },
  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "#111827",
  },
  smallInput: {
    width: 80,
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  label: { fontWeight: "600", marginRight: 8, alignSelf: "center" },
  hint: { color: "#6b7280", marginLeft: -40 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, justifyContent: "center" },
  addBtn: { backgroundColor: "#10b981" },
  btnText: { color: "#fff", fontWeight: "600" },
  actionRow: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 12 },
  resetBtn: { backgroundColor: "#3b82f6", flex: 1 },
  message: { color: "#16a34a", marginBottom: 8 },
  error: { color: "#ef4444", marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginVertical: 8 },
  replyRow: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  replyText: { flex: 1, color: "#111827", marginRight: 10 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconRow: { flexDirection: "row", gap: 8, marginLeft: 8 },
  iconBtn: { padding: 6 },
  delayInput: {
    width: 92,
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    textAlign: "center",
  },
});
