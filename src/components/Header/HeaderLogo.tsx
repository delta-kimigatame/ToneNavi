import { Avatar, Box, Typography } from "@mui/material";
import React from "react";
import { setting } from "../../config/siteConfig";

/**
 * ヘッダに表示されるロゴ。
 * ロゴをタップした際は公開サイトへ遷移する。
 */
export const HeaderLogo: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}>
      <Box
        component="a"
        href={setting.siteUrl}
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          cursor: "pointer",
          color: "inherit",
          textDecoration: "none"
        }}
      >
        <Avatar
          sx={{ width: 40, height: 40, mx: 1 }}
          variant="square"
          src="./static/logo192.png"
          alt={`${setting.productName} logo`}
        />
        <Typography variant="subtitle2" sx={{ display: { xs: "none", sm: "block" } }}>
          {setting.productName}
        </Typography>
      </Box>
    </Box>
  );
};
