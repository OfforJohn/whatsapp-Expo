import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { useState } from "react";
import { auth } from "@/components/utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axios from "axios";
import { useAuthStore } from "@/components/utils/authStore"; // your Zustand store
import { ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const defaultImage =
    "https://i.ibb.co/CJg5v0F/default-avatar.png"; // fallback image

const handleSignUp = async () => {
  setLoading(true);

  console.log("▶️ Sign up started...");
  console.log("Entered details:", { fullName, email });

  try {
    if (!email || !password || !fullName)
      throw new Error("Please fill all fields");

    // 1️⃣ Create user in Firebase
    console.log("🔵 Creating Firebase user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUid = userCredential.user.uid;
    console.log("✅ Firebase user created:", firebaseUid);

    // 2️⃣ Save user in backend
    console.log("🔵 Sending user to backend:", {
      uid: firebaseUid,
      email,
      name: fullName,
    });

 const { data } = await axios.post(ONBOARD_USER_ROUTE, {
  firebaseUid,              // ✔ Correct backend field
  email,
  name: fullName,
  about: "Available",
  image: defaultImage,
});


    console.log("🟢 Backend response:", data);

    if (!data.status) {
      console.log("❌ Backend failed to create user");
      throw new Error("Failed to create backend profile");
    }

    // 3️⃣ Save to Zustand// 3️⃣ Save to Zustand with BOTH firebaseUid AND backend numeric ID
console.log("🟣 Saving user to Zustand...");

setUser({
  uid: firebaseUid,
  backendId: data.data.id,            // ⭐ save backend numeric ID here
  name: data.data.name,
  email: data.data.email,
  profileImage: data.data.profilePicture,
  status: data.data.about,
});

console.log("✅ User stored in Zustand with backend id:", data.data.id);


    Toast.show({
      type: "success",
      text1: "Account created!",
      text2: "Welcome 🎉",
    });

    // 4️⃣ Redirect home
    console.log("➡️ Redirecting to home...");
    router.replace("/");

  } catch (error: any) {
    console.log("❌ SIGNUP ERROR:", error);

    Toast.show({
      type: "error",
      text1: "Signup failed",
      text2: error.message || "Check your details",
    });
  } finally {
    setLoading(false);
    console.log("⏹ Sign up process finished.");
  }
};


  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/whatsapp.gif")}
        style={styles.logo}
      />

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#ccc"
      />
 {/* Password input with show/hide toggle */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#ccc"
          style={styles.input}
        />
        <Pressable
          style={styles.showButton}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Text style={styles.showButtonText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating account..." : "Sign Up"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.signInContainer}
        onPress={() => router.push("/sign-in")}
      >
        <Text style={styles.signInText}>
          Already have an account?{" "}
          <Text style={styles.signInLink}>Sign In</Text>
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
    inputWrapper: {
    position: "relative",
    marginBottom: 15,
  },
   showButton: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  showButtonText: {
    color: "#fff",
    fontWeight: "600",
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
