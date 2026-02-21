import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Modal,
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
import {
  getCustomWords,
  saveCustomWords,
  getCustomSentences,
  saveCustomSentences,
} from "../utils/storage";

type Props = NativeStackScreenProps<RootStackParamList, "ManageWords">;
type Tab = "word" | "sentence";

export default function ManageWordsScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>("word");
  const [customWords, setCustomWords] = useState<WordItem[]>([]);
  const [customSentences, setCustomSentences] = useState<SentenceItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [japanese, setJapanese] = useState("");
  const [reading, setReading] = useState("");
  const [thai, setThai] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const words = await getCustomWords();
    const sentences = await getCustomSentences();
    setCustomWords(words);
    setCustomSentences(sentences);
  };

  const handleAdd = async () => {
    if (!japanese.trim() || !thai.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "ต้องกรอกภาษาญี่ปุ่นและภาษาไทย");
      return;
    }

    if (tab === "word") {
      const newWord: WordItem = {
        id: `cw-${Date.now()}`,
        japanese: japanese.trim(),
        reading: reading.trim(),
        thai: thai.trim(),
      };
      const updated = [...customWords, newWord];
      setCustomWords(updated);
      await saveCustomWords(updated);
    } else {
      const newSentence: SentenceItem = {
        id: `cs-${Date.now()}`,
        japanese: japanese.trim(),
        reading: reading.trim(),
        thai: thai.trim(),
        category: category.trim() || "กำหนดเอง",
      };
      const updated = [...customSentences, newSentence];
      setCustomSentences(updated);
      await saveCustomSentences(updated);
    }

    setJapanese("");
    setReading("");
    setThai("");
    setCategory("");
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("ลบรายการ", "ต้องการลบรายการนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          if (tab === "word") {
            const updated = customWords.filter((w) => w.id !== id);
            setCustomWords(updated);
            await saveCustomWords(updated);
          } else {
            const updated = customSentences.filter((s) => s.id !== id);
            setCustomSentences(updated);
            await saveCustomSentences(updated);
          }
        },
      },
    ]);
  };

  const data = tab === "word" ? customWords : customSentences;

  const renderItem = ({ item }: { item: WordItem | SentenceItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.itemJp}>{item.japanese}</Text>
        {item.reading ? (
          <Text style={styles.itemReading}>{item.reading}</Text>
        ) : null}
        <Text style={styles.itemTh}>{item.thai}</Text>
        {"category" in item && item.category ? (
          <Text style={styles.itemCategory}>📁 {item.category}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
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
          <Text style={styles.title}>📝 จัดการคำ / ประโยค</Text>
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
                📖 คำศัพท์ ({customWords.length})
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
                📝 ประโยค ({customSentences.length})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* List */}
        {data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>
              ยังไม่มี{tab === "word" ? "คำ" : "ประโยค"}ที่เพิ่มเอง
            </Text>
            <Text style={styles.emptySubText}>กดปุ่ม + ด้านล่างเพื่อเพิ่ม</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                เพิ่ม{tab === "word" ? "คำ" : "ประโยค"}ใหม่
              </Text>

              <TextInput
                style={styles.input}
                placeholder="ภาษาญี่ปุ่น (Japanese)"
                placeholderTextColor={colors.textMuted}
                value={japanese}
                onChangeText={setJapanese}
              />
              <TextInput
                style={styles.input}
                placeholder="คำอ่าน (Reading)"
                placeholderTextColor={colors.textMuted}
                value={reading}
                onChangeText={setReading}
              />
              <TextInput
                style={styles.input}
                placeholder="ภาษาไทย (Thai)"
                placeholderTextColor={colors.textMuted}
                value={thai}
                onChangeText={setThai}
              />
              {tab === "sentence" && (
                <TextInput
                  style={styles.input}
                  placeholder="หมวดหมู่ (Category)"
                  placeholderTextColor={colors.textMuted}
                  value={category}
                  onChangeText={setCategory}
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowModal(false);
                    setJapanese("");
                    setReading("");
                    setThai("");
                    setCategory("");
                  }}
                >
                  <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.addBtn}
                  >
                    <Text style={styles.addBtnText}>เพิ่ม</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
    marginBottom: spacing.md,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemContent: { flex: 1 },
  itemJp: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  itemReading: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTh: {
    fontSize: fontSize.md,
    color: colors.accent,
    marginTop: 2,
  },
  itemCategory: {
    fontSize: fontSize.xs,
    color: colors.info,
    marginTop: 4,
  },
  deleteBtn: {
    padding: spacing.sm,
  },
  deleteBtnText: {
    fontSize: 22,
  },
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 24,
    right: 24,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 40 : spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  addBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  addBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
