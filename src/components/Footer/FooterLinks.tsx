import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";
import { setting } from "../../config/siteConfig";

/**
 * フッターのリンク一覧
 */
const FooterLinks: React.FC = () => {

  return (
    <Box sx={{ flex: 1, order: 1 }}>
      <Typography>
        <Link variant="body2" color="inherit" href={setting.developerXUrl}>
          開発者Xアカウント
        </Link>{" "}
        <br />
        <Link variant="body2" color="inherit" href={setting.githubUrl}>
          GitHub
        </Link>{" "}
        <br />
        <Link variant="body2" color="inherit" href={setting.discordUrl}>
          discord
        </Link>{" "}
        <br />
        <br />
      </Typography>
    </Box>
  );
};

export default FooterLinks;
