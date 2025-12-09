// ContactsScreen.tsx
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  SectionList,
  Pressable,
} from "react-native";

interface Contact {
  id: number;
  email: string;
  name: string;
  profilePicture: string;
  about: string;
}

interface Section {
  title: string;
  data: Contact[];
}

interface ContactsScreenProps {
  onClose: () => void;
  contactsData: { [key: string]: Contact[] };
}

export default function ContactsScreen({ onClose, contactsData }: ContactsScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);

  useEffect(() => {
    // Transform the object into SectionList data
    const sections: Section[] = Object.entries(contactsData).map(
      ([key, contacts]) => ({
        title: key,
        data: contacts,
      })
    );

    if (searchTerm.trim() === "") {
      setFilteredSections(sections);
      return;
    }

    // Filter contacts based on search term
    const filtered = sections
      .map(({ title, data }) => {
        const filteredData = data.filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { title, data: filteredData };
      })
      .filter((section) => section.data.length > 0);

    setFilteredSections(filtered);
  }, [searchTerm, contactsData]);

  const renderContact = ({ item }: { item: Contact }) => (
    
  <Pressable
      onPress={() => {
  router.push({
    pathname: "/chat/[chatId]",
    params: {
      chatId: item.id.toString(),
      chatName: item.name,
      chatAvatar: item.profilePicture
    }
  });
}}

    >
      <View style={styles.contactRow}>
        <Image
          source={{
            uri: item.profilePicture.startsWith("http")
              ? item.profilePicture
              : "https://i.ibb.co/CJg5v0F/default-avatar.png",
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactAbout}>{item.about || "Available"}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search Contacts"
          placeholderTextColor="#777"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Contact list */}
      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderContact}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B141A", paddingHorizontal: 10, paddingTop: 10 },
  searchContainer: {
    backgroundColor: "#202C33",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    color: "#fff",
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 16,
    color: "#2ec4b6",
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#0B141A",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#1c252c",
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#128c7e",
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
  },
  contactAbout: {
    color: "#999",
    fontSize: 12,
  },
});
