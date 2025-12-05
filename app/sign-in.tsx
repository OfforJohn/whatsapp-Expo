import { View, TextInput, Pressable, Text, StyleSheet, Image } from "react-native";
import { useState } from "react";
import { useAuthStore } from "@/components/utils/authStore";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function SignInScreen() {
  const router = useRouter();
  const logIn = useAuthStore((state) => state.logIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await logIn(email, password);
      Toast.show({
        type: "success",
        text1: "Logged in!",
        text2: "Welcome back 👋",
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: e.message || "Check your credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* WhatsApp Logo */}
      <Image source={require("../assets/images/whatsapp.gif")} style={styles.logo} />

      {/* Inputs */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      {/* Login Button */}
      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
      </Pressable>

      {/* Sign Up Link */}
      <Pressable style={styles.signUpContainer} onPress={() => router.push("/sign-up")}>
        <Text style={styles.signUpText}>
          Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
      </Pressable>

      {/* Toast container */}
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
  signUpContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpText: {
    color: "#fff",
    fontSize: 14,
  },
  signUpLink: {
    fontWeight: "bold",
    color: "#25D366",
  },
});
