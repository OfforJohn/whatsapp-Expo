import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  currentUserId: string | number;
  onDelete?: (messageId: string) => void; // callback to delete message
  showDelete?: boolean; // show delete button
  deleting?: boolean;   // if the message is currently deleting
}

export default function MessageBubble({
  message,
  currentUserId,
  onDelete,
  showDelete = false,
  deleting = false,
}: MessageBubbleProps) {
  const isMine = message.senderId === Number(currentUserId);

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.mine : styles.theirs,
        deleting && { opacity: 0.3 }, // fade out when deleting
      ]}
    >
      <View style={styles.row}>
        {/* Message text */}
        <Text style={styles.text}>{message.message}</Text>

        {/* Meta (time + status) */}
        <View style={styles.metaInline}>
          <Text style={styles.time}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {isMine && <MessageStatus status={message.messageStatus} />}
        </View>

        {/* Delete button */}
        {showDelete && isMine && onDelete && (
          <Pressable
            onPress={() => onDelete(message.id)}
            style={{
              marginLeft: 6,
              backgroundColor: "red",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ---------------------------------- */
/* Message Status Icons               */
/* ---------------------------------- */
function MessageStatus({ status }: { status: Message["messageStatus"] }) {
  if (status === "read") {
    return (
      <Ionicons
        name="checkmark-done"
        size={16}
        color="#53BDEB"
        style={styles.tick}
      />
    );
  }

  if (status === "delivered") {
    return (
      <Ionicons
        name="checkmark-done"
        size={16}
        color="#8696A0"
        style={styles.tick}
      />
    );
  }

  return (
    <Ionicons
      name="checkmark"
      size={16}
      color="#8696A0"
      style={styles.tick}
    />
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

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },

  text: {
    color: "#E9EDF0",
    fontSize: 15,
    flexShrink: 1,
  },

  metaInline: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },

  time: {
    fontSize: 11,
    color: "#8696A0",
  },

  tick: {
    marginLeft: 4,
  },
});
