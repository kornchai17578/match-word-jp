export interface WordItem {
  id: string;
  japanese: string;
  reading: string;
  thai: string;
}

export interface SentenceItem {
  id: string;
  japanese: string;
  reading: string;
  thai: string;
  category: string;
}

export type GameType = "word" | "sentence";

export type TimerOption = 0 | 30 | 60 | 120;

export interface GameSettings {
  gameType: GameType;
  wordCount: number;
  timerSeconds: TimerOption;
  selectedItems: (WordItem | SentenceItem)[];
}

export interface MatchItem {
  id: string;
  text: string;
  pairId: string;
  side: "left" | "right";
  matched: boolean;
}

export interface GameResult {
  totalPairs: number;
  matchedPairs: number;
  timeUsed: number;
  timerSetting: TimerOption;
}
