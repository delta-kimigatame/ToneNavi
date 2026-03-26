import * as React from "react";

import Box from "@mui/material/Box";

import { Divider, Link, Typography } from "@mui/material";
import { BasePaper } from "../common/BasePaper";

/**
 * トップビューに表示する、リンク集
 * @returns トップビューに表示する、リンク集
 */
export const LinkPaper: React.FC = () => {
  return (
    <BasePaper title={"リンク集"}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="subtitle2">UTAU関連リンク</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link
              variant="body2"
              href="https://utau2008.xrea.jp/"
              target="_blank"
            >
              UTAU公式サイト
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://www.openutau.com/"
              target="_blank"
            >
              OpenUtau公式サイト
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://k-uta.jp/utalet/"
              target="_blank"
            >
              Utalet
            </Link>
          </li>
        </ul>
        <Divider />
        <br />
        <Typography variant="subtitle2">きみがためtools関連リンク</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link
              variant="body2"
              href="https://k-uta.jp/laberu/"
              target="_blank"
            >
              原音設定ツール LABERU
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://k-uta.jp/gakuya/"
              target="_blank"
            >
              音源パッケージングツール Gakuya
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://k-uta.jp/utalet/"
              target="_blank"
            >
              音声合成ツール Utalet
            </Link>
          </li>
        </ul>
        <Divider />
        <br />
        <Typography variant="subtitle2">関連アプリ(他作者)</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link
              variant="body2"
              href="https://github.com/sdercolin/recstar"
              target="_blank"
            >
              録音アプリ RecStar
            </Link>
          </li>
        </ul>
      </Box>
    </BasePaper>
  );
};
