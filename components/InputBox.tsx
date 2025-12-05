import { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function InputBox({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View style={styles.row}>
      <View style={styles.inputContainer}>
        <Ionicons name="happy-outline" color="#8696A0" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor="#8696A0"
          value={text}
          onChangeText={setText}
        />
        <Ionicons name="attach-outline" color="#8696A0" size={24} />
        <Ionicons name="camera-outline" color="#8696A0" size={24} />
      </View>

      <Pressable style={styles.micButton} onPress={send}>
        <MaterialCommunityIcons
          name={text ? "send" : "microphone"}
          size={22}
          color="#181616ff"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 8,
    alignItems: "flex-end",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#202C33",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  micButton: {
    width: 48,
    height: 48,
    backgroundColor: "#00A884",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
