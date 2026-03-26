import * as React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BasePaper } from "../common/BasePaper";
import { setting } from "../../config/siteConfig";
import { Main } from "../../features/Main/Main";

/**
 * トップビューに表示する、メインコンテンツ
 * @returns トップビューに表示する、メインコンテンツ
 */
export const MainPaper: React.FC = () => {
  return (
    <BasePaper title={setting.productName}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="body1">
          UTAU音源を録音するための音程を決めよう!<br />
          このツールでは、録音予定の声を分析して、録音に適した音程を提案します。<br />
        </Typography>
        <br />
        <Main />
      </Box>
    </BasePaper>
  );
};
