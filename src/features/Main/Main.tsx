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

/**
 * Harvest の f0 列から有声フレーム（f0 > 0）の平均周波数を算出する
 * @param f0 - Harvest が返す基本周波数列
 * @returns 有声フレームの平均周波数 (Hz)。有声フレームがない場合は 0
 */
const calcMeanF0 = (f0: Float64Array): number => {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < f0.length; i++) {
    if (f0[i] > 0) {
      sum += f0[i];
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
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
    setData(recordedData);
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
