import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  TextInput,
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
import { WordItem, SentenceItem } from "../types/types";
import { defaultWords } from "../data/words";
import { defaultSentences } from "../data/sentences";
import { getCustomWords, getCustomSentences } from "../utils/storage";
import * as Speech from "expo-speech";

type Props = NativeStackScreenProps<RootStackParamList, "BrowseAll">;
type Tab = "word" | "sentence";

export default function BrowseAllScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>("word");
  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [allSentences, setAllSentences] = useState<SentenceItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const customW = await getCustomWords();
    const customS = await getCustomSentences();
    setAllWords([...defaultWords, ...customW]);
    setAllSentences([...defaultSentences, ...customS]);
  };

  const speakJapanese = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ja-JP", rate: 0.85 });
  };

  const speakThai = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "th-TH", rate: 0.9 });
  };

  const filteredWords = allWords.filter((w) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      w.japanese.toLowerCase().includes(s) ||
      w.reading.toLowerCase().includes(s) ||
      w.thai.toLowerCase().includes(s)
    );
  });

  const filteredSentences = allSentences.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.japanese.toLowerCase().includes(q) ||
      s.reading.toLowerCase().includes(q) ||
      s.thai.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const renderWord = ({ item, index }: { item: WordItem; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.cardIndex}>{index + 1}</Text>
      <View style={styles.cardContent}>
        <TouchableOpacity
          onPress={() => speakJapanese(item.japanese)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardJp}>🔊 {item.japanese}</Text>
        </TouchableOpacity>
        <Text style={styles.cardReading}>{item.reading}</Text>
        <TouchableOpacity
          onPress={() => speakThai(item.thai)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTh}>🔊 {item.thai}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentence = ({
    item,
    index,
  }: {
    item: SentenceItem;
    index: number;
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardIndex}>{index + 1}</Text>
      <View style={styles.cardContent}>
        <TouchableOpacity
          onPress={() => speakJapanese(item.japanese)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardJp}>🔊 {item.japanese}</Text>
        </TouchableOpacity>
        <Text style={styles.cardReading}>{item.reading}</Text>
        <TouchableOpacity
          onPress={() => speakThai(item.thai)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTh}>🔊 {item.thai}</Text>
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← กลับ</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📚 คลังคำ / ประโยค</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setTab("word")}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={
                tab === "word"
                  ? ["#667eea", "#764ba2"]
                  : ["transparent", "transparent"]
              }
              style={[styles.tab, tab !== "word" && styles.tabInactive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab !== "word" && styles.tabTextInactive,
                ]}
              >
                📖 คำศัพท์ (
                {tab === "word" ? filteredWords.length : allWords.length})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("sentence")}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={
                tab === "sentence"
                  ? ["#f093fb", "#f5576c"]
                  : ["transparent", "transparent"]
              }
              style={[styles.tab, tab !== "sentence" && styles.tabInactive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab !== "sentence" && styles.tabTextInactive,
                ]}
              >
                📝 ประโยค (
                {tab === "sentence"
                  ? filteredSentences.length
                  : allSentences.length}
                )
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 ค้นหา... (ญี่ปุ่น / ไทย / คำอ่าน)"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* List */}
        {tab === "word" ? (
          <FlatList
            data={filteredWords}
            renderItem={renderWord}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={filteredSentences}
            renderItem={renderSentence}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    padding: spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : spacing.xl,
  },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.textSecondary, fontSize: fontSize.md },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  tabInactive: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  tabTextInactive: {
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
  },
  cardIndex: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    width: 30,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardJp: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: "#667eea",
    marginBottom: 2,
  },
  cardReading: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardTh: {
    fontSize: fontSize.md,
    color: "#f093fb",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: colors.info,
  },
});
