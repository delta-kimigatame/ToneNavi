import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
import { type HarvestReturn, World } from "tsworld";

import { hzToNoteName } from "../../utils/pitchUtils";
import { RecordButton } from "./RecordButton";

/**
 * 録音データの簡易統計情報
 */
interface RecordStats {
  /** サンプル数 */
  length: number;
  /** 秒数 (サンプル数 / サンプリングレート) */
  durationSec: number;
  /** 振幅の最小値 */
  min: number;
  /** 振幅の最大値 */
  max: number;
  /** 振幅の絶対値平均 (RMS の近似) */
  absMean: number;
}

/**
 * PCM データから DC オフセットを除去し、ピーク値で [-1, 1] に正規化する。
 * ピーク値が 0 の場合（無音）はゼロ埋めした配列をそのまま返す。
 * @param data - 録音済み PCM データ (44100Hz)
 * @returns DC オフセット除去・正規化済みの Float64Array
 */
const removeDcAndNormalize = (data: Float64Array): Float64Array => {
  // DC オフセット（平均値）を算出
  const mean = data.reduce((sum, v) => sum + v, 0) / data.length;

  // DC オフセット除去後のピーク絶対値を算出
  const peak = data.reduce((max, v) => Math.max(max, Math.abs(v - mean)), 0);

  if (peak === 0) {
    // 無音の場合はゼロ埋めのまま返す
    return new Float64Array(data.length);
  }

  return data.map((v) => (v - mean) / peak);
};

/**
 * Float64Array から簡易統計情報を算出する
 * @param data - 録音済み PCM データ (44100Hz)
 * @param sampleRate - サンプリングレート (Hz)
 * @returns 統計情報オブジェクト
 */
const calcStats = (data: Float64Array, sampleRate: number): RecordStats => {
  let min = Infinity;
  let max = -Infinity;
  let absSum = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
    absSum += Math.abs(v);
  }

  return {
    length: data.length,
    durationSec: data.length / sampleRate,
    min,
    max,
    absMean: absSum / data.length,
  };
};

/** 歌声の F0 として有効とみなす周波数範囲 (Hz) */
const F0_MIN_HZ = 80;
const F0_MAX_HZ = 1000;

/**
 * Harvest の f0 列から歌声の有効フレーム（80〜1000 Hz）の平均周波数を算出する。
 * 範囲外の値（無音の 0 Hz や解析失敗フレームを含む）は外れ値として除外する。
 * 有効フレーム数が全フレームの半数未満の場合は異常値とみなし 0 を返す。
 * @param f0 - Harvest が返す基本周波数列
 * @returns 有効フレームの平均周波数 (Hz)。有効フレームが不十分な場合は 0
 */
const calcMeanF0 = (f0: Float64Array): number => {
  const { sum, count } = f0.reduce(
    (acc, v) =>
      v >= F0_MIN_HZ && v <= F0_MAX_HZ
        ? { sum: acc.sum + v, count: acc.count + 1 }
        : acc,
    { sum: 0, count: 0 },
  );
  return count >= f0.length / 2 ? sum / count : 0;
};

/**
 * 録音実行のログ情報
 */
interface RecordLog {
  /** 録音が成功したかどうか */
  success: boolean;
  /** 失敗時のエラーメッセージ */
  errorMessage?: string;
}

/**
 * アプリのメイン処理コンポーネント (暫定)。
 * tsworld の初期化完了後に RecordButton を表示する。
 * 取得した Float64Array の統計情報を表示してデータを確認する。
 */
export const Main: React.FC = () => {
  /** tsworld の初期化完了フラグ */
  const [worldReady, setWorldReady] = React.useState(false);
  /** tsworld の初期化エラーメッセージ。エラーなしの場合は null */
  const [worldError, setWorldError] = React.useState<string | null>(null);
  /** tsworld の World インスタンス。初期化前は null */
  const worldRef = React.useRef<World | null>(null);

  /** 録音済み PCM データ。未録音時は null */
  const [data, setData] = React.useState<Float64Array | null>(null);

  /** 録音の実行ログ。録音未実施時は null */
  const [recordLog, setRecordLog] = React.useState<RecordLog | null>(null);

  /** 録音成功時のハンドラ */
  const handleRecorded = React.useCallback((recordedData: Float64Array) => {
    const processed = removeDcAndNormalize(recordedData);
    setData(processed);
    setRecordLog({ success: true });
  }, []);

  /** 録音失敗時のハンドラ */
  const handleRecordError = React.useCallback((error: Error) => {
    setRecordLog({ success: false, errorMessage: error.message });
  }, []);

  /** Harvest の解析結果。未解析時は null */
  const [harvestResult, setHarvestResult] =
    React.useState<HarvestReturn | null>(null);

  /** data が更新されたら Harvest を実行する */
  React.useEffect(() => {
    if (data === null || worldRef.current === null) {
      return;
    }
    const result = worldRef.current.Harvest(data, 44100, 5);
    setHarvestResult(result);
  }, [data]);

  /** マウント時に tsworld の wasm を初期化する */
  React.useEffect(() => {
    const initWorld = async () => {
      try {
        const world = new World();
        await world.Initialize();
        worldRef.current = world;
        setWorldReady(true);
      } catch (e) {
        setWorldError(
          e instanceof Error ? e.message : "tsworld の初期化に失敗しました",
        );
      }
    };
    void initWorld();
  }, []);

  /** data から算出した統計情報。data が null のときは null */
  const stats = React.useMemo<RecordStats | null>(
    () => (data !== null ? calcStats(data, 44100) : null),
    [data],
  );

  /** Harvest の f0 列から算出した有声フレームの平均周波数 (Hz) */
  const meanF0 = React.useMemo<number | null>(
    () => (harvestResult !== null ? calcMeanF0(harvestResult.f0) : null),
    [harvestResult],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 1 }}>
      {worldError !== null && (
        <Typography variant="body2" color="error">
          {worldError}
        </Typography>
      )}

      {!worldReady && worldError === null && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">初期化中...</Typography>
        </Box>
      )}

      {worldReady && (
        <RecordButton onRecorded={handleRecorded} onError={handleRecordError} />
      )}

      {/* メイン結果：音高名を横幅いっぱいの巨大な文字で表示 */}
      {meanF0 !== null && meanF0 > 0 && (
        <Box sx={{ textAlign: "center", py: 1 }}>
          <Typography>あなたに適した音程は</Typography>
          <Typography
            sx={{
              fontSize: "min(40vw, 14rem)",
              fontWeight: "bold",
              lineHeight: 1,
              my: 0.5,
            }}
          >
            {hzToNoteName(meanF0)}
          </Typography>
          <Typography>です。</Typography>
        </Box>
      )}

      {/* 分析失敗メッセージ */}
      {meanF0 !== null && meanF0 === 0 && (
        <Typography variant="body2" color="error">
          分析に十分な声が検出されませんでした。もう1度お試しください。
        </Typography>
      )}

      {/* 実行ログアコーディオン */}
      {recordLog !== null && (
        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">実行ログ</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* 録音の成否 */}
            <Typography variant="subtitle2" gutterBottom>
              録音
            </Typography>
            <Typography variant="body2">
              {recordLog.success
                ? "✅ 成功"
                : `❌ 失敗: ${recordLog.errorMessage ?? "不明なエラー"}`}
            </Typography>

            {/* 録音データのサマリー */}
            {stats !== null && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  録音データ
                </Typography>
                <Typography variant="body2">
                  サンプル数：{stats.length.toLocaleString()} samples
                </Typography>
                <Typography variant="body2">
                  長さ：{stats.durationSec.toFixed(3)} 秒
                </Typography>
                <Typography variant="body2">
                  最小振幅：{stats.min.toFixed(6)}
                </Typography>
                <Typography variant="body2">
                  最大振幅：{stats.max.toFixed(6)}
                </Typography>
                <Typography variant="body2">
                  絶対値平均：{stats.absMean.toFixed(6)}
                </Typography>
              </>
            )}

            {/* F0 解析結果 */}
            {meanF0 !== null && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  F0 解析
                </Typography>
                <Typography variant="body2">
                  平均基本周波数：
                  {meanF0 > 0
                    ? `${meanF0.toFixed(2)} Hz`
                    : "無声（有声フレームなし）"}
                </Typography>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};
