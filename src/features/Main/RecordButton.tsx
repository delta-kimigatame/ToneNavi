import Button from "@mui/material/Button";
import React from "react";

/** 録音する秒数 */
const RECORD_SECONDS = 3;
/** 出力するサンプリングレート (Hz) */
const TARGET_SAMPLE_RATE = 44100;

/**
 * RecordButton コンポーネントの Props
 */
export interface RecordButtonProps {
	/** 録音完了時に呼ばれるコールバック。44100Hz の Float64Array を受け取る */
	onRecorded: (data: Float64Array) => void;
	/** 録音失敗時に呼ばれるコールバック */
	onError?: (error: Error) => void;
	/** ボタンを無効化するかどうか */
	disabled?: boolean;
}

/**
 * 複数の Float32Array チャンクを結合して一つの Float32Array にまとめる
 * @param chunks - 録音中に蓄積された PCM チャンクの配列
 * @returns 結合済みの Float32Array
 */
const mergeFloat32Chunks = (chunks: Float32Array[]): Float32Array => {
	const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const merged = new Float32Array(totalLength);

	let offset = 0;
	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.length;
	}

	return merged;
};

/**
 * 線形補間によって PCM データを任意のサンプリングレートに変換する
 * @param input - 変換元の PCM データ
 * @param inputSampleRate - 変換元のサンプリングレート (Hz)
 * @param targetSampleRate - 変換先のサンプリングレート (Hz)
 * @returns リサンプリング済みの Float32Array
 */
const resampleLinear = (
	input: Float32Array,
	inputSampleRate: number,
	targetSampleRate: number,
): Float32Array => {
	if (inputSampleRate === targetSampleRate) {
		return input;
	}

	const outputLength = Math.max(
		1,
		Math.round((input.length * targetSampleRate) / inputSampleRate),
	);
	const output = new Float32Array(outputLength);
	const ratio = inputSampleRate / targetSampleRate;

	for (let i = 0; i < outputLength; i += 1) {
		const position = i * ratio;
		const index = Math.floor(position);
		const nextIndex = Math.min(index + 1, input.length - 1);
		const frac = position - index;

		output[i] = input[index] * (1 - frac) + input[nextIndex] * frac;
	}

	return output;
};

/**
 * 3秒間音声を録音し、44100Hz の Float64Array として親コンポーネントへ返すボタン
 */
export const RecordButton: React.FC<RecordButtonProps> = ({
	onRecorded,
	onError,
	disabled = false,
}) => {
	/** 現在録音中かどうかを示すフラグ */
	const [isRecording, setIsRecording] = React.useState(false);
	/** タイムアウトコールバック内で参照するための isRecording の ref */
	const isRecordingRef = React.useRef(false);

	/** 録音中に蓄積する PCM チャンクの配列 */
	const chunksRef = React.useRef<Float32Array[]>([]);
	/** Web Audio API のコンテキスト */
	const audioContextRef = React.useRef<AudioContext | null>(null);
	/** マイク入力のメディアストリーム */
	const mediaStreamRef = React.useRef<MediaStream | null>(null);
	/** マイク入力のソースノード */
	const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
	/** PCM データを取得する AudioWorklet ノード */
	const processorRef = React.useRef<AudioWorkletNode | null>(null);
	/** スピーカー出力をミュートするゲインノード */
	const muteGainRef = React.useRef<GainNode | null>(null);
	/** 自動停止用のタイマー ID */
	const timerRef = React.useRef<number | null>(null);

	/** Audio ノードとメディアストリームを全て破棄してリソースを解放する */
	const cleanupNodes = React.useCallback(async () => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		processorRef.current?.port.close();
		processorRef.current?.disconnect();
		sourceRef.current?.disconnect();
		muteGainRef.current?.disconnect();

		processorRef.current = null;
		sourceRef.current = null;
		muteGainRef.current = null;

		mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
		mediaStreamRef.current = null;

		if (audioContextRef.current !== null) {
			await audioContextRef.current.close();
			audioContextRef.current = null;
		}
	}, []);

	/** 録音を停止し、PCM データをリサンプリングして onRecorded コールバックへ渡す */
	const stopRecording = React.useCallback(async () => {
		if (!isRecordingRef.current) {
			return;
		}

		isRecordingRef.current = false;
		setIsRecording(false);

		const inputSampleRate = audioContextRef.current?.sampleRate ?? TARGET_SAMPLE_RATE;
		const merged = mergeFloat32Chunks(chunksRef.current);
		chunksRef.current = [];

		await cleanupNodes();

		if (merged.length === 0) {
			return;
		}

		const resampled = resampleLinear(merged, inputSampleRate, TARGET_SAMPLE_RATE);
		const float64 = new Float64Array(resampled.length);
		for (let i = 0; i < resampled.length; i += 1) {
			float64[i] = resampled[i];
		}

		onRecorded(float64);
	}, [cleanupNodes, onRecorded]);

	/** マイク権限を取得して録音を開始し、RECORD_SECONDS 秒後に自動停止する */
	const startRecording = React.useCallback(async () => {
		if (isRecording) {
			return;
		}

		const mediaStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				channelCount: 1,
			},
			video: false,
		});

		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(mediaStream);

		await audioContext.audioWorklet.addModule(
			new URL("../../workers/recorder-processor.js", import.meta.url),
		);
		const workletNode = new AudioWorkletNode(audioContext, "recorder-processor");
		const muteGain = audioContext.createGain();
		muteGain.gain.value = 0;

		chunksRef.current = [];

		workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
			chunksRef.current.push(event.data);
		};

		source.connect(workletNode);
		workletNode.connect(muteGain);
		muteGain.connect(audioContext.destination);

		mediaStreamRef.current = mediaStream;
		audioContextRef.current = audioContext;
		sourceRef.current = source;
		processorRef.current = workletNode;
		muteGainRef.current = muteGain;

		isRecordingRef.current = true;
		setIsRecording(true);

		timerRef.current = window.setTimeout(() => {
			void stopRecording();
		}, RECORD_SECONDS * 1000);
	}, [isRecording, stopRecording]);

	React.useEffect(() => {
		return () => {
			void cleanupNodes();
		};
	}, [cleanupNodes]);

	/** ボタン押下時のハンドラ。録音開始に失敗した場合はクリーンアップを行う */
	const handleClick = async () => {
		try {
			await startRecording();
		} catch (e) {
			isRecordingRef.current = false;
			setIsRecording(false);
			await cleanupNodes();
			onError?.(e instanceof Error ? e : new Error(String(e)));
		}
	};

	return (
		<Button variant="contained" onClick={handleClick} disabled={disabled || isRecording}>
			{isRecording ? "録音中..." : "3秒録音"}
		</Button>
	);
};

