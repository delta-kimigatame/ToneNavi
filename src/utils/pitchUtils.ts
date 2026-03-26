/** 音高名の一覧 (C から B まで半音単位) */
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/**
 * 周波数 (Hz) を MIDI ノート番号に変換する。
 * A4 = 440Hz = MIDI 69 を基準とする。
 * @param hz - 変換する周波数 (Hz)
 * @returns 最も近い MIDI ノート番号 (整数)
 */
export const hzToMidi = (hz: number): number => {
	return Math.round(12 * Math.log2(hz / 440) + 69);
};

/**
 * MIDI ノート番号を音高名 (例: "A4", "C#3") に変換する。
 * @param midi - MIDI ノート番号
 * @returns 音高名の文字列
 */
export const midiToNoteName = (midi: number): string => {
	const noteIndex = ((midi % 12) + 12) % 12;
	const octave = Math.floor(midi / 12) - 1;
	return `${NOTE_NAMES[noteIndex]}${octave}`;
};

/**
 * 周波数 (Hz) から最も近い音高名を返す。
 * 精度は 1 半音。A4 = 440Hz、A3 = 220Hz を基準とする。
 * @param hz - 変換する周波数 (Hz)。0 以下の場合は null を返す
 * @returns 音高名の文字列 (例: "A4", "C#3")。無効な周波数の場合は null
 */
export const hzToNoteName = (hz: number): string | null => {
	if (hz <= 0 || !isFinite(hz)) {
		return null;
	}
	return midiToNoteName(hzToMidi(hz));
};
