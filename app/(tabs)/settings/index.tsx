import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>

        {/* HEADER */}
      <View style={styles.header}>
  <Pressable onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </Pressable>
  <Text style={styles.headerTitle}>Settings</Text>
</View>


        {/* PROFILE SECTION */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.profileName}>Admin</Text>
            <Text style={styles.profileStatus}>Admin Panel</Text>
          </View>
        </View>

        {/* MENU SECTIONS */}
   <SettingsItem
  icon={<Ionicons name="key-outline" size={24} color="#00A884" />}
  title="Account"
  subtitle="Security notifications, change number"
  onPress={() => router.push("/settings/account")}
/>


        <SettingsItem
          icon={<Ionicons name="lock-closed-outline" size={24} color="#00A884" />}
          title="Privacy"
          subtitle="Block contacts, disappearing messages"
        />

        <SettingsItem
          icon={<MaterialCommunityIcons name="face-man-profile" size={24} color="#00A884" />}
          title="Avatar"
          subtitle="Create, edit, profile photo"
        />

        <SettingsItem
          icon={<Ionicons name="albums-outline" size={24} color="#00A884" />}
          title="Lists"
          subtitle="Manage people and groups"
        />

        <SettingsItem
          icon={<Ionicons name="chatbubbles-outline" size={24} color="#00A884" />}
          title="Chats"
          subtitle="Theme, wallpapers, chat history"
        />

        <SettingsItem
          icon={<Ionicons name="notifications-outline" size={24} color="#00A884" />}
          title="Notifications"
          subtitle="Messages, group & call tones"
        />

        <SettingsItem
          icon={<Ionicons name="sync-outline" size={24} color="#00A884" />}
          title="Storage and data"
          subtitle="Network usage, auto-download"
        />

        <SettingsItem
          icon={<Ionicons name="accessibility-outline" size={24} color="#00A884" />}
          title="Accessibility"
          subtitle="Increase contrast, animation"
        />

      </ScrollView>
    </View>
  );
}

const SettingsItem = ({ icon, title, subtitle, onPress }: any) => (
  <Pressable style={styles.itemRow} onPress={onPress}>
    {icon}
    <View style={{ marginLeft: 15 }}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSubtitle}>{subtitle}</Text>
    </View>
  </Pressable>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B141A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 20,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2c34",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  profileStatus: {
    color: "#8a939a",
    marginTop: 3,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2c34",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  itemSubtitle: {
    color: "#8a939a",
    fontSize: 13,
    marginTop: 2,
  },
});
