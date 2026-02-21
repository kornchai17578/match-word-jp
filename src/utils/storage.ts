import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem, SentenceItem } from "../types/types";

const CUSTOM_WORDS_KEY = "custom_words";
const CUSTOM_SENTENCES_KEY = "custom_sentences";

export const getCustomWords = async (): Promise<WordItem[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCustomWords = async (words: WordItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
  } catch (e) {
    console.error("Error saving custom words:", e);
  }
};

export const getCustomSentences = async (): Promise<SentenceItem[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_SENTENCES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCustomSentences = async (
  sentences: SentenceItem[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_SENTENCES_KEY, JSON.stringify(sentences));
  } catch (e) {
    console.error("Error saving custom sentences:", e);
  }
};
