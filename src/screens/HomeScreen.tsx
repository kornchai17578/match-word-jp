import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../styles/theme";
import { initSounds } from "../utils/sounds";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    initSounds();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Text style={styles.logoText}>言葉</Text>
            </LinearGradient>
            <Text style={styles.title}>マッチ言葉</Text>
            <Text style={styles.subtitle}>จับคู่คำภาษาไทย-ญี่ปุ่น</Text>
            <Text style={styles.tagline}>เรียนรู้ภาษาญี่ปุ่นอย่างสนุก 🎌</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("GameSettings")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>🎮 เริ่มเล่น</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("ManageWords")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                📝 จัดการคำ / ประโยค
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("BrowseAll")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                📚 ดูคำ / ประโยคทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>สำหรับนักศึกษามหาวิทยาลัย 🎓</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: {
    fontSize: 42,
    color: colors.textPrimary,
    fontWeight: fontWeight.extrabold,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
    gap: spacing.md,
  },
  primaryButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: "rgba(102, 126, 234, 0.08)",
  },
  secondaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
