import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ColorCircle from "./color_circle";
import { SxProps } from "@mui/material";

export interface SeriesItemTitleProps {
  listItem?: boolean;
  label?: string | undefined;
  onClick?: undefined | (() => void);
  onAdd?: undefined | (() => void);
  onRemove?: undefined | (() => void);
  color?: undefined | string | string[];
  icon?: undefined | React.ReactNode;
  iconWidth?: undefined | number;
}

export default function SeriesItemTitle({
  listItem,
  label,
  color,
  onClick,
  icon,
  iconWidth,
  onAdd,
  onRemove,
}: SeriesItemTitleProps) {
  const mainContent = (
    <>
      {icon && (
        <ListItemIcon
          {...(typeof iconWidth !== "undefined" ?
            { sx: { minWidth: iconWidth } }
          : undefined)}
        >
          {icon}
        </ListItemIcon>
      )}
      {color && (
        <ColorCircle
          marginLeft={icon ? 1 : 0}
          {...(typeof color === "string" ? { color } : { colors: color })}
        />
      )}
      {label && <ListItemText primary={label} />}
    </>
  );

  const mainSx: SxProps = {
    flex: "1 1 0%",
  };
  if (!icon && iconWidth) {
    mainSx.paddingLeft = iconWidth + "px";
  }

  return (
    <Box
      component={listItem ? "li" : "div"}
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="start"
      paddingRight={3}
    >
      <ListItemButton onClick={onClick} disabled={!onClick} sx={mainSx}>
        {mainContent}
      </ListItemButton>

      {onAdd && (
        <IconButton edge="end" aria-label="add option" onClick={onAdd}>
          <AddIcon />
        </IconButton>
      )}
      {onRemove && (
        <IconButton edge="end" aria-label="remove option" onClick={onRemove}>
          <RemoveIcon />
        </IconButton>
      )}
    </Box>
  );
}
