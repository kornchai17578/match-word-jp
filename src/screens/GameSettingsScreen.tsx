import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
import { GameType, TimerOption, GameSettings } from "../types/types";
import { defaultWords } from "../data/words";
import { defaultSentences } from "../data/sentences";
import { getCustomWords, getCustomSentences } from "../utils/storage";

type Props = NativeStackScreenProps<RootStackParamList, "GameSettings">;

const TIMER_OPTIONS: { label: string; value: TimerOption }[] = [
  { label: "ไม่จำกัดเวลา", value: 0 },
  { label: "30 วินาที", value: 30 },
  { label: "1 นาที", value: 60 },
  { label: "2 นาที", value: 120 },
];

export default function GameSettingsScreen({ navigation }: Props) {
  const [gameType, setGameType] = useState<GameType>("word");
  const [wordCount, setWordCount] = useState(10);
  const [timer, setTimer] = useState<TimerOption>(0);
  const [maxAvailable, setMaxAvailable] = useState(100);

  useEffect(() => {
    loadAvailableCount();
  }, [gameType]);

  const loadAvailableCount = async () => {
    if (gameType === "word") {
      const custom = await getCustomWords();
      setMaxAvailable(defaultWords.length + custom.length);
    } else {
      const custom = await getCustomSentences();
      setMaxAvailable(defaultSentences.length + custom.length);
    }
  };

  const effectiveMax = Math.min(30, maxAvailable);
  const effectiveMin = Math.min(10, maxAvailable);

  const handleStartGame = () => {
    const settings: GameSettings = {
      gameType,
      wordCount: Math.min(wordCount, effectiveMax),
      timerSeconds: timer,
      selectedItems: [],
    };
    navigation.navigate("Game", { settings });
  };

  const handleSelectWords = () => {
    const settings: GameSettings = {
      gameType,
      wordCount: Math.min(wordCount, effectiveMax),
      timerSeconds: timer,
      selectedItems: [],
    };
    navigation.navigate("WordSelection", { settings });
  };

  const adjustCount = (delta: number) => {
    setWordCount((prev) => {
      const next = prev + delta;
      if (next < effectiveMin) return effectiveMin;
      if (next > effectiveMax) return effectiveMax;
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>← กลับ</Text>
            </TouchableOpacity>
            <Text style={styles.title}>⚙️ ตั้งค่าเกม</Text>
          </View>

          {/* Game Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ประเภทการเล่น</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                onPress={() => setGameType("word")}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={
                    gameType === "word"
                      ? ["#667eea", "#764ba2"]
                      : ["#1E2D50", "#1E2D50"]
                  }
                  style={[
                    styles.optionCard,
                    gameType !== "word" && styles.optionCardInactive,
                  ]}
                >
                  <Text style={styles.optionEmoji}>📖</Text>
                  <Text
                    style={[
                      styles.optionText,
                      gameType !== "word" && styles.optionTextInactive,
                    ]}
                  >
                    คำศัพท์
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGameType("sentence")}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={
                    gameType === "sentence"
                      ? ["#f093fb", "#f5576c"]
                      : ["#1E2D50", "#1E2D50"]
                  }
                  style={[
                    styles.optionCard,
                    gameType !== "sentence" && styles.optionCardInactive,
                  ]}
                >
                  <Text style={styles.optionEmoji}>📝</Text>
                  <Text
                    style={[
                      styles.optionText,
                      gameType !== "sentence" && styles.optionTextInactive,
                    ]}
                  >
                    ประโยค
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Word Count */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              จำนวน{gameType === "word" ? "คำ" : "ประโยค"} (คู่)
            </Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  wordCount <= effectiveMin && styles.counterBtnDisabled,
                ]}
                onPress={() => adjustCount(-5)}
                disabled={wordCount <= effectiveMin}
              >
                <Text style={styles.counterBtnText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  wordCount <= effectiveMin && styles.counterBtnDisabled,
                ]}
                onPress={() => adjustCount(-1)}
                disabled={wordCount <= effectiveMin}
              >
                <Text style={styles.counterBtnText}>-1</Text>
              </TouchableOpacity>
              <View style={styles.counterDisplay}>
                <Text style={styles.counterValue}>
                  {Math.min(wordCount, effectiveMax)}
                </Text>
                <Text style={styles.counterLabel}>
                  {effectiveMin}~{effectiveMax}{" "}
                  {gameType === "word" ? "คำ" : "ประโยค"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  wordCount >= effectiveMax && styles.counterBtnDisabled,
                ]}
                onPress={() => adjustCount(1)}
                disabled={wordCount >= effectiveMax}
              >
                <Text style={styles.counterBtnText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  wordCount >= effectiveMax && styles.counterBtnDisabled,
                ]}
                onPress={() => adjustCount(5)}
                disabled={wordCount >= effectiveMax}
              >
                <Text style={styles.counterBtnText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ เวลา</Text>
            <View style={styles.timerGrid}>
              {TIMER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setTimer(opt.value)}
                  activeOpacity={0.8}
                  style={{ width: "48%" }}
                >
                  <LinearGradient
                    colors={
                      timer === opt.value
                        ? ["#11998e", "#38ef7d"]
                        : ["#1E2D50", "#1E2D50"]
                    }
                    style={[
                      styles.timerCard,
                      timer !== opt.value && styles.timerCardInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timerText,
                        timer !== opt.value && styles.timerTextInactive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleSelectWords} activeOpacity={0.8}>
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>
                  🔍 เลือก{gameType === "word" ? "คำ" : "ประโยค"}เอง
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleStartGame} activeOpacity={0.8}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>
                  🚀 เริ่มเกม (สุ่มอัตโนมัติ)
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : spacing.xl,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  optionCard: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  optionCardInactive: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  optionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  optionTextInactive: {
    color: colors.textSecondary,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgCardLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterBtnDisabled: {
    opacity: 0.3,
  },
  counterBtnText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  counterDisplay: {
    alignItems: "center",
    minWidth: 80,
    paddingHorizontal: spacing.md,
  },
  counterValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.accent,
  },
  counterLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  timerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  timerCard: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  timerCardInactive: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  timerTextInactive: {
    color: colors.textSecondary,
  },
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  selectButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  selectButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  startButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
