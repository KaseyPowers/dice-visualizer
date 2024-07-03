import Box, { BoxProps } from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import AddIcon from "@mui/icons-material/Add";
import { CombinedOptionValues, SeriesData, SeriesConfig } from "../use_results";

export type ColorProp = BoxProps["color"];
type CircleProps = {
  color: ColorProp;
} & Pick<BoxProps, "marginLeft" | "marginX">;

const circleSize = 2;

const Circle = ({ color, ...rest }: CircleProps) => (
  <Box
    {...rest}
    display="span"
    bgcolor={color!}
    borderRadius="50%"
    sx={(theme) => {
      const size = theme.spacing(circleSize);
      return {
        width: size,
        height: size,
      };
    }}
  />
);

export default function ColorCircle(
  props: { marginLeft?: number } & (
    | { color: ColorProp }
    | { colors: ColorProp[] }
  ),
) {
  if ("color" in props) {
    return (
      <Circle color={props.color} marginLeft={-1 + (props.marginLeft ?? 0)} />
    );
  }
  return (
    <Box
      display="flex"
      flexDirection="row-reverse"
      marginLeft={props.marginLeft ?? 0}
      marginRight={1}
    >
      {props.colors.toReversed().map((color, i) => (
        <Circle key={i} color={color} marginLeft={-1} />
      ))}
    </Box>
  );
}
