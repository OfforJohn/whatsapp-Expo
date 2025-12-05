import { useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    Image,
    Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { SafeAreaView } from 'react-native-safe-area-context';
import MessageBubble from "@/components/MessageBubble";
import InputBox from "@/components/InputBox";


export default function ChatScreen({ params }: { params: { chatId: string } }) {
    const { chatId } = params;

    const [messages, setMessages] = useState([
        { id: "1", text: "Hello!", sender: "Alice" },
        { id: "2", text: "Hi!", sender: "You" },
    ]);

    const flatListRef = useRef<FlatList<any>>(null);

    const sendMessage = (text: string) => {
        const newMsg = { id: Date.now().toString(), text, sender: "You" };
        setMessages((prev) => [newMsg, ...prev]);
    };

    const router = useRouter();


    useEffect(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [messages]);

    return (<
        
        SafeAreaView style={styles.safe}>
        {/* WhatsApp-style header */}
        <View style={styles.header}>
      <Pressable onPress={() => router.push("/")}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
</Pressable>

            <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/68.jpg" }}
                style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
                <Text style={styles.name}>Alice</Text>
                <Text style={styles.status}>online</Text>
            </View>
            <Pressable style={{ marginHorizontal: 8 }}>
                <Ionicons name="call" size={24} color="#fff" />
            </Pressable>
            <Pressable>
                <MaterialIcons name="videocam" size={24} color="#fff" />
            </Pressable>
        </View>

        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                inverted
                renderItem={({ item }) => <MessageBubble message={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10, paddingBottom: 0 }}
                keyboardShouldPersistTaps="handled"
            />

            <View style={styles.inputWrapper}>
                <InputBox onSend={sendMessage} />
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#111B21", // Matches screenshot dark theme
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#202C33", // Newer WhatsApp dark header color
        elevation: 4,

        paddingTop: 30,       // ⬅⬅ Add this
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
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 4,
    },
    inputWrapper: {
        backgroundColor: "#111B21",
        paddingBottom: Platform.OS === "ios" ? 12 : 6,
    },
});
