/**
 * AudioWorklet プロセッサ。
 * 入力チャンネル(モノラル)の PCM データをメインスレッドへ送信する。
 * ScriptProcessorNode.onaudioprocess の代替として使用する。
 */
class RecorderProcessor extends AudioWorkletProcessor {
  /**
   * @param {Float32Array[][]} inputs - 入力バッファ。inputs[0][0] がモノラル PCM データ
   * @returns {boolean} true を返すことでノードを生存させ続ける
   */
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel) {
      /** バッファは AudioWorklet 内で再利用されるため、slice でコピーしてから送信する */
      this.port.postMessage(channel.slice());
    }
    return true;
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
