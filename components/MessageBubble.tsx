import { View, Text, StyleSheet } from "react-native";

interface Message {
  id: string;
  message: string;
  senderId: number;
  recieverId: number;
  messageStatus: "sent" | "delivered" | "read";
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId: string | number; // accept string or number
}

export default function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isMine = message.senderId === Number(currentUserId); // convert string → number if needed

  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <Text style={styles.text}>{message.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  mine: {
    backgroundColor: "#005C4B",
    marginLeft: "auto",
    borderBottomRightRadius: 2,
  },
  theirs: {
    backgroundColor: "#202C33",
    marginRight: "auto",
    borderBottomLeftRadius: 2,
  },
  text: {
    color: "#E9EDF0",
  },
});
