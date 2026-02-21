import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
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

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

export default function ResultScreen({ navigation, route }: Props) {
  const { result, settings } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const percentage = Math.round(
    (result.matchedPairs / result.totalPairs) * 100,
  );
  const isAllMatched = result.matchedPairs >= result.totalPairs;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getEmoji = () => {
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "🌟";
    if (percentage >= 50) return "💪";
    return "📚";
  };

  const getMessage = () => {
    if (percentage === 100) return "สุดยอดมาก! จับคู่ได้ครบ!";
    if (percentage >= 80) return "เก่งมาก! เกือบครบแล้ว!";
    if (percentage >= 50) return "ดีเลย! ลองอีกครั้งนะ";
    return "พยายามอีกนิด สู้ๆ!";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Score Circle */}
          <Animated.View
            style={[
              styles.scoreContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={
                isAllMatched ? ["#11998e", "#38ef7d"] : ["#667eea", "#764ba2"]
              }
              style={styles.scoreCircle}
            >
              <Text style={styles.emoji}>{getEmoji()}</Text>
              <Text style={styles.scorePercent}>{percentage}%</Text>
              <Text style={styles.scorePairs}>
                {result.matchedPairs} / {result.totalPairs} คู่
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Message */}
          <Animated.View
            style={[styles.messageContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.message}>{getMessage()}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={styles.statValue}>
                  {formatTime(result.timeUsed)}
                </Text>
                <Text style={styles.statLabel}>เวลาที่ใช้</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>{result.matchedPairs}</Text>
                <Text style={styles.statLabel}>คู่ที่จับถูก</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statValue}>{result.totalPairs}</Text>
                <Text style={styles.statLabel}>ทั้งหมด</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => navigation.replace("GameSettings")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>🔄 เล่นอีกครั้ง</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.popToTop()}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>🏠 กลับหน้าหลัก</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: Platform.OS === "ios" ? 80 : spacing.xl,
  },
  scoreContainer: {
    marginBottom: spacing.xl,
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 42,
    marginBottom: spacing.xs,
  },
  scorePercent: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
  scorePairs: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  messageContainer: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  message: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  buttonContainer: {
    width: "100%",
    gap: spacing.md,
  },
  primaryBtn: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  secondaryBtn: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: "rgba(102, 126, 234, 0.08)",
  },
  secondaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
