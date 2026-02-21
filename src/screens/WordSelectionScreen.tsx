import React, { useState, useEffect, useMemo } from "react";
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

type Props = NativeStackScreenProps<RootStackParamList, "WordSelection">;
type FilterType = "all" | "default" | "custom";

export default function WordSelectionScreen({ navigation, route }: Props) {
  const { settings } = route.params;
  const [allItems, setAllItems] = useState<(WordItem | SentenceItem)[]>([]);
  const [customIds, setCustomIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    let items: (WordItem | SentenceItem)[] = [];
    let cIds = new Set<string>();

    if (settings.gameType === "word") {
      const custom = await getCustomWords();
      items = [...defaultWords, ...custom];
      custom.forEach((c) => cIds.add(c.id));
    } else {
      const custom = await getCustomSentences();
      items = [...defaultSentences, ...custom];
      custom.forEach((c) => cIds.add(c.id));
    }

    setAllItems(items);
    setCustomIds(cIds);

    // Auto-select random items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const count = Math.min(settings.wordCount, shuffled.length);
    const ids = new Set(shuffled.slice(0, count).map((i) => i.id));
    setSelectedIds(ids);
  };

  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by source
    if (filter === "custom") {
      items = items.filter((i) => customIds.has(i.id));
    } else if (filter === "default") {
      items = items.filter((i) => !customIds.has(i.id));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.japanese.toLowerCase().includes(q) ||
          i.reading.toLowerCase().includes(q) ||
          i.thai.toLowerCase().includes(q),
      );
    }

    return items;
  }, [allItems, filter, search, customIds]);

  const customCount = allItems.filter((i) => customIds.has(i.id)).length;
  const defaultCount = allItems.length - customCount;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < settings.wordCount) {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    const count = Math.min(settings.wordCount, shuffled.length);
    setSelectedIds(new Set(shuffled.slice(0, count).map((i) => i.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const handleStart = () => {
    const selected = allItems.filter((i) => selectedIds.has(i.id));
    navigation.navigate("Game", {
      settings: { ...settings, selectedItems: selected },
    });
  };

  const isReady = selectedIds.size === settings.wordCount;

  const renderItem = ({ item }: { item: WordItem | SentenceItem }) => {
    const isSelected = selectedIds.has(item.id);
    const isCustom = customIds.has(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleItem(item.id)}
        activeOpacity={0.7}
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
      >
        <View style={styles.itemContent}>
          <View style={styles.checkbox}>
            {isSelected && <View style={styles.checkboxInner} />}
          </View>
          <View style={styles.itemTexts}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemJapanese} numberOfLines={1}>
                {item.japanese}
              </Text>
              {isCustom && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>เพิ่มเอง</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemReading} numberOfLines={1}>
              {item.reading}
            </Text>
            <Text style={styles.itemThai} numberOfLines={1}>
              {item.thai}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← กลับ</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            เลือก{settings.gameType === "word" ? "คำ" : "ประโยค"}
          </Text>
          <Text style={styles.countText}>
            เลือกแล้ว{" "}
            <Text style={[styles.countNum, isReady && styles.countReady]}>
              {selectedIds.size}
            </Text>
            {" / "}
            {settings.wordCount}
          </Text>

          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 ค้นหา... (ญี่ปุ่น / ไทย / คำอ่าน)"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {[
              {
                key: "all" as FilterType,
                label: `ทั้งหมด (${allItems.length})`,
              },
              {
                key: "default" as FilterType,
                label: `ค่าเริ่มต้น (${defaultCount})`,
              },
              {
                key: "custom" as FilterType,
                label: `เพิ่มเอง (${customCount})`,
              },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterBtn,
                  filter === f.key && styles.filterBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filter === f.key && styles.filterBtnTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={selectAll} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>🎲 สุ่มใหม่</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>✖ ล้างทั้งหมด</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search.trim()
                  ? "ไม่พบรายการที่ค้นหา"
                  : filter === "custom"
                    ? "ยังไม่มีรายการที่เพิ่มเอง"
                    : "ไม่มีรายการ"}
              </Text>
            </View>
          }
        />

        {/* Start Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={!isReady}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isReady ? ["#667eea", "#764ba2"] : ["#333", "#333"]}
              style={[styles.startBtn, !isReady && styles.startBtnDisabled]}
            >
              <Text
                style={[
                  styles.startBtnText,
                  !isReady && styles.startBtnTextDisabled,
                ]}
              >
                {isReady
                  ? "🚀 เริ่มเกม!"
                  : `เลือกอีก ${settings.wordCount - selectedIds.size} รายการ`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingBottom: spacing.sm,
  },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.textSecondary, fontSize: fontSize.md },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  countText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  countNum: {
    fontWeight: fontWeight.bold,
    color: colors.warning,
    fontSize: fontSize.lg,
  },
  countReady: {
    color: colors.success,
  },
  searchInput: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  filterBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
  },
  filterBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  filterBtnTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgCardLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(102, 126, 234, 0.12)",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  itemTexts: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemJapanese: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  customBadge: {
    backgroundColor: "rgba(240, 147, 251, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  customBadgeText: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  itemReading: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemThai: {
    fontSize: fontSize.md,
    color: colors.accent,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.lg,
  },
  startBtn: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  startBtnDisabled: {
    opacity: 0.5,
  },
  startBtnText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  startBtnTextDisabled: {
    color: colors.textMuted,
  },
});
