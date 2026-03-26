import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

/**
 * フッターの免責事項
 */
const FooterDisclaimer: React.FC<{ matches: boolean }> = ({ matches }) => {

  return (
    <Box
      sx={{
        textAlign: matches ? "right" : "left",
        flex: 1,
        order: matches ? 3 : 2,
      }}
    >
      <Typography variant="caption">
        UTAUは飴屋／菖蒲氏によって公開されている、Windows向けに作成された歌声合成ソフトウェアです。
        <br />
        <br />
        本ソフトウェアはUTAU公式とは無関係です。
      </Typography>
      <br />
      <br />
    </Box>
  );
};

export default FooterDisclaimer;
