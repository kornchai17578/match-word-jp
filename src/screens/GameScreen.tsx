import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
  Dimensions,
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
import { WordItem, SentenceItem, MatchItem } from "../types/types";
import { defaultWords } from "../data/words";
import { defaultSentences } from "../data/sentences";
import { getCustomWords, getCustomSentences } from "../utils/storage";
import { playTap, playCorrect, playWrong, playGameOver } from "../utils/sounds";
import * as Speech from "expo-speech";

type Props = NativeStackScreenProps<RootStackParamList, "Game">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScreen({ navigation, route }: Props) {
  const { settings } = route.params;
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wrongPair, setWrongPair] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const initGame = async () => {
    let items: (WordItem | SentenceItem)[] = [];

    if (settings.selectedItems && settings.selectedItems.length > 0) {
      items = settings.selectedItems;
    } else {
      // Random selection
      if (settings.gameType === "word") {
        const custom = await getCustomWords();
        const all = [...defaultWords, ...custom];
        items = shuffle(all).slice(0, settings.wordCount);
      } else {
        const custom = await getCustomSentences();
        const all = [...defaultSentences, ...custom];
        items = shuffle(all).slice(0, settings.wordCount);
      }
    }

    const left: MatchItem[] = shuffle(
      items.map((item) => ({
        id: `left-${item.id}`,
        text: item.thai,
        pairId: item.id,
        side: "left" as const,
        matched: false,
      })),
    );

    const right: MatchItem[] = shuffle(
      items.map((item) => ({
        id: `right-${item.id}`,
        text: item.japanese,
        pairId: item.id,
        side: "right" as const,
        matched: false,
      })),
    );

    // Init animations
    [...left, ...right].forEach((item) => {
      shakeAnims[item.id] = new Animated.Value(0);
      fadeAnims[item.id] = new Animated.Value(1);
    });

    setLeftItems(left);
    setRightItems(right);
    setTotalPairs(items.length);

    // Start timer
    if (settings.timerSeconds > 0) {
      setTimeLeft(settings.timerSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Elapsed timer
    elapsedRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  // Check for game over conditions
  useEffect(() => {
    if (gameOver) return;

    if (totalPairs > 0 && matchedPairs >= totalPairs) {
      endGame();
    } else if (settings.timerSeconds > 0 && timeLeft <= 0 && totalPairs > 0) {
      endGame();
    }
  }, [matchedPairs, timeLeft, totalPairs]);

  const endGame = () => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    playGameOver();

    setTimeout(() => {
      navigation.replace("Result", {
        result: {
          totalPairs,
          matchedPairs,
          timeUsed: elapsed,
          timerSetting: settings.timerSeconds,
        },
        settings,
      });
    }, 1500);
  };

  const handlePress = useCallback(
    (item: MatchItem) => {
      if (item.matched || gameOver) return;

      // Speak the word/sentence
      Speech.stop();
      Speech.speak(item.text, {
        language: item.side === "left" ? "th-TH" : "ja-JP",
        rate: 0.9,
      });

      if (!selected) {
        setSelected(item);
        return;
      }

      if (selected.id === item.id) {
        setSelected(null);
        return;
      }

      if (selected.side === item.side) {
        setSelected(item);
        return;
      }

      // Check match
      if (selected.pairId === item.pairId) {
        // Correct!
        playCorrect();
        const matchIds = [selected.id, item.id];

        // Fade out animation
        matchIds.forEach((id) => {
          Animated.timing(fadeAnims[id], {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });

        setLeftItems((prev) =>
          prev.map((i) =>
            i.pairId === item.pairId ? { ...i, matched: true } : i,
          ),
        );
        setRightItems((prev) =>
          prev.map((i) =>
            i.pairId === item.pairId ? { ...i, matched: true } : i,
          ),
        );
        setMatchedPairs((prev) => prev + 1);
        setSelected(null);
      } else {
        // Wrong!
        playWrong();
        const wrongIds = new Set([selected.id, item.id]);
        setWrongPair(wrongIds);

        // Shake animation
        [selected.id, item.id].forEach((id) => {
          Animated.sequence([
            Animated.timing(shakeAnims[id], {
              toValue: 10,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnims[id], {
              toValue: -10,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnims[id], {
              toValue: 10,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnims[id], {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ]).start();
        });

        setTimeout(() => {
          setWrongPair(new Set());
          setSelected(null);
        }, 500);
      }
    },
    [selected, gameOver],
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const renderCard = (item: MatchItem) => {
    const isSelected = selected?.id === item.id;
    const isWrong = wrongPair.has(item.id);
    const isThai = item.side === "left";

    return (
      <Animated.View
        key={item.id}
        style={[
          {
            opacity: fadeAnims[item.id] || 1,
            transform: [{ translateX: shakeAnims[item.id] || 0 }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
          disabled={item.matched}
          style={[
            styles.card,
            item.matched && styles.cardMatched,
            isSelected &&
              (isThai ? styles.cardSelectedThai : styles.cardSelectedJp),
            isWrong && styles.cardWrong,
          ]}
        >
          <Text
            style={[
              isThai ? styles.cardTextThai : styles.cardTextJp,
              item.matched && styles.cardTextMatched,
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {item.matched ? "✓" : item.text}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.pairCount}>
              ✅ {matchedPairs}/{totalPairs}
            </Text>
          </View>
          <View style={styles.headerCenter}>
            {settings.timerSeconds > 0 ? (
              <View
                style={[
                  styles.timerBadge,
                  timeLeft <= 10 && styles.timerBadgeDanger,
                ]}
              >
                <Text
                  style={[
                    styles.timerText,
                    timeLeft <= 10 && styles.timerTextDanger,
                  ]}
                >
                  ⏱️ {formatTime(timeLeft)}
                </Text>
              </View>
            ) : (
              <Text style={styles.elapsedText}>⏱️ {formatTime(elapsed)}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerRight}
          >
            <Text style={styles.quitText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Game area */}
        <ScrollView
          contentContainerStyle={styles.gameArea}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.columns}>
            {/* Thai column */}
            <View style={[styles.column, { paddingRight: spacing.xs }]}>
              <Text style={styles.columnTitle}>🇹🇭 ไทย</Text>
              {leftItems.map(renderCard)}
            </View>

            {/* Japanese column */}
            <View style={[styles.column, { paddingLeft: spacing.xs }]}>
              <Text style={styles.columnTitle}>🇯🇵 ญี่ปุ่น</Text>
              {rightItems.map(renderCard)}
            </View>
          </View>
        </ScrollView>

        {/* Game Over overlay */}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              {matchedPairs >= totalPairs ? "🎉 สุดยอด!" : "⏰ หมดเวลา!"}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "ios" ? 56 : spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flex: 1 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight: { flex: 1, alignItems: "flex-end" },
  pairCount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  timerBadge: {
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  timerBadgeDanger: {
    backgroundColor: "rgba(245, 87, 108, 0.3)",
  },
  timerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  timerTextDanger: {
    color: colors.error,
  },
  elapsedText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  quitText: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },
  gameArea: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  columns: {
    flexDirection: "row",
  },
  column: {
    width: "50%",
    overflow: "hidden",
  },
  columnTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  cardMatched: {
    backgroundColor: "rgba(56, 239, 125, 0.08)",
    borderColor: "rgba(56, 239, 125, 0.3)",
  },
  cardSelectedThai: {
    borderColor: "#f093fb",
    backgroundColor: "rgba(240, 147, 251, 0.12)",
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cardSelectedJp: {
    borderColor: "#667eea",
    backgroundColor: "rgba(102, 126, 234, 0.12)",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cardWrong: {
    borderColor: colors.error,
    backgroundColor: "rgba(245, 87, 108, 0.15)",
  },
  cardTextThai: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: "#f093fb",
    textAlign: "center",
  },
  cardTextJp: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: "#667eea",
    textAlign: "center",
  },
  cardTextMatched: {
    color: colors.success,
    fontSize: fontSize.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
});
