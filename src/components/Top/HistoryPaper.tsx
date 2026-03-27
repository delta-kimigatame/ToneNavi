import * as React from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { BasePaper } from "../common/BasePaper";

/**
 * トップビューに表示する、更新履歴
 * @returns トップビューに表示する、更新履歴
 */
export const HistoryPaper: React.FC = () => {
  return (
    <BasePaper title={"更新履歴"}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="body2">
          2026/3/28_2 分析精度の改良<br />
          2026/3/28 初版公開
          </Typography>
        <Divider />
      </Box>
    </BasePaper>
  );
};
