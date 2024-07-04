import Box, { BoxProps } from "@mui/material/Box";

export type ColorProp = BoxProps["color"];
type CircleProps = {
  color: ColorProp;
} & Pick<BoxProps, "marginLeft" | "marginRight">;

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
      <Circle
        color={props.color}
        marginLeft={-1 + (props.marginLeft ?? 0)}
        marginRight={1}
      />
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
