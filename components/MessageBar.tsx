import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Text,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface MessageBarProps {
  onSend: (text: string) => void;
}

export default function MessageBar({ onSend }: MessageBarProps) {
  const [message, setMessage] = useState("");
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const toggleAudioRecorder = () => setShowAudioRecorder(!showAudioRecorder);
  const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker);

  return (
    <View style={styles.container}>
      {/* Emoji / Attach buttons */}
      <View style={styles.leftButtons}>
        <Pressable onPress={toggleEmojiPicker} style={styles.iconButton}>
          <Ionicons name="happy-outline" size={24} color="#fff" />
        </Pressable>
        <Pressable onPress={() => console.log("Open image picker")} style={styles.iconButton}>
          <Ionicons name="attach-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Text input */}
      {!showAudioRecorder && (
        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          placeholderTextColor="#aaa"
          style={styles.textInput}
          multiline
        />
      )}

      {/* Audio recorder / Send button */}
      <View style={styles.rightButton}>
        {message.length > 0 ? (
          <Pressable onPress={handleSend}>
            <Ionicons name="send" size={24} color="#00A884" />
          </Pressable>
        ) : (
          <Pressable onPress={toggleAudioRecorder}>
            <MaterialIcons name="keyboard-voice" size={28} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    alignItems: "center",
    gap: 8,
  },
  leftButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#1C1C1E",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rightButton: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
