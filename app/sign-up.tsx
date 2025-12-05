import { View, TextInput, Text, Pressable, StyleSheet, Image } from "react-native";
import { useState } from "react";
import { auth } from "@/components/utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      if (!email || !password) throw new Error("Please enter email and password");

      await createUserWithEmailAndPassword(auth, email, password);

      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "You can now log in 👋",
      });

      router.replace("/sign-in"); // redirect to Sign In after signup
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: error.message || "Check your details",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* WhatsApp Logo */}
      <Image source={require("../assets/images/whatsapp.gif")} style={styles.logo} />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Creating account..." : "Sign Up"}</Text>
      </Pressable>

      {/* Sign In Link */}
      <Pressable style={styles.signInContainer} onPress={() => router.push("/sign-in")}>
        <Text style={styles.signInText}>
          Already have an account? <Text style={styles.signInLink}>Sign In</Text>
        </Text>
      </Pressable>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#075E54",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#25D366",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    color: "#fff",
    backgroundColor: "#128C7E",
  },
  button: {
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signInContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signInText: {
    color: "#fff",
    fontSize: 14,
  },
  signInLink: {
    fontWeight: "bold",
    color: "#25D366",
  },
});
