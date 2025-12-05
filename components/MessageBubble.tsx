import { View, Text, StyleSheet } from "react-native";

interface Message {
  text: string;
  sender: string;
}

export default function MessageBubble({ message }: { message: Message }) {
  const isMine = message.sender === "You";

  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <Text style={styles.text}>{message.text}</Text>
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
  text: { color: "#E9EDF0" },
});
