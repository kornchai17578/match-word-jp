import { Audio } from "expo-av";

let tapSound: Audio.Sound | null = null;
let correctSound: Audio.Sound | null = null;
let wrongSound: Audio.Sound | null = null;
let gameOverSound: Audio.Sound | null = null;

// Generate a simple beep tone as a WAV data URI
function generateTone(
  frequency: number,
  duration: number,
  volume: number = 0.3,
): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, Math.min(t * 20, (duration - t) * 20));
    samples[i] = Math.floor(
      128 + 127 * volume * envelope * Math.sin(2 * Math.PI * frequency * t),
    );
  }

  // Create WAV file
  const dataSize = numSamples;
  const fileSize = 44 + dataSize;
  const buffer = new Uint8Array(fileSize);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) buffer[offset + i] = str.charCodeAt(i);
  };
  const writeUint32 = (offset: number, value: number) => {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
    buffer[offset + 2] = (value >> 16) & 0xff;
    buffer[offset + 3] = (value >> 24) & 0xff;
  };
  const writeUint16 = (offset: number, value: number) => {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
  };

  writeString(0, "RIFF");
  writeUint32(4, fileSize - 8);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  writeUint32(16, 16);
  writeUint16(20, 1); // PCM
  writeUint16(22, 1); // mono
  writeUint32(24, sampleRate);
  writeUint32(28, sampleRate);
  writeUint16(32, 1);
  writeUint16(34, 8); // 8 bits
  writeString(36, "data");
  writeUint32(40, dataSize);

  for (let i = 0; i < numSamples; i++) {
    buffer[44 + i] = samples[i];
  }

  // Convert to base64
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }

  return "data:audio/wav;base64," + btoa(binary);
}

async function createSound(
  frequency: number,
  duration: number,
  volume: number = 0.3,
): Promise<Audio.Sound> {
  const uri = generateTone(frequency, duration, volume);
  const { sound } = await Audio.Sound.createAsync({ uri });
  return sound;
}

export async function initSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    tapSound = await createSound(800, 0.08, 0.2);
    correctSound = await createSound(1200, 0.15, 0.3);
    wrongSound = await createSound(300, 0.25, 0.3);
    gameOverSound = await createSound(600, 0.4, 0.4);
  } catch (e) {
    console.log("Sound init error:", e);
  }
}

export async function playTap(): Promise<void> {
  try {
    if (tapSound) {
      await tapSound.setPositionAsync(0);
      await tapSound.playAsync();
    }
  } catch {}
}

export async function playCorrect(): Promise<void> {
  try {
    if (correctSound) {
      await correctSound.setPositionAsync(0);
      await correctSound.playAsync();
    }
  } catch {}
}

export async function playWrong(): Promise<void> {
  try {
    if (wrongSound) {
      await wrongSound.setPositionAsync(0);
      await wrongSound.playAsync();
    }
  } catch {}
}

export async function playGameOver(): Promise<void> {
  try {
    if (gameOverSound) {
      await gameOverSound.setPositionAsync(0);
      await gameOverSound.playAsync();
    }
  } catch {}
}

export async function cleanupSounds(): Promise<void> {
  try {
    if (tapSound) await tapSound.unloadAsync();
    if (correctSound) await correctSound.unloadAsync();
    if (wrongSound) await wrongSound.unloadAsync();
    if (gameOverSound) await gameOverSound.unloadAsync();
    tapSound = null;
    correctSound = null;
    wrongSound = null;
    gameOverSound = null;
  } catch {}
}
