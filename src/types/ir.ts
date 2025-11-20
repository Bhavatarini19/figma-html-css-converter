export interface IRStyle {
  position?: "absolute" | "relative" | "static";
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  zIndex?: number;

  display?: "flex" | "block" | "inline-block" | "none";
  flexDirection?: "row" | "column";
  gap?: number;
  alignItems?: string;
  justifyContent?: string;

  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  fontStyle?: string;
  textAlign?: string;
  verticalAlign?: string;
  letterSpacing?: number;
  lineHeight?: number | string;

  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImages?: string[];
  opacity?: number;
  blendMode?: string;
  backgroundBlendMode?: string;

  borderRadius?: number | number[];
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  borderDashPattern?: number[];
  multipleStrokes?: Array<{ width: number; color: string; style?: string }>;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;

  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;

  boxShadow?: string;
  filter?: string;
  transform?: string;
  boxSizing?: string;
  clipPath?: string;
  overflow?: string;
  placeholderColor?: string;
}

export interface IRNode {
  id: string;
  name: string;
  type: "TEXT" | "FRAME" | "BUTTON" | "INPUT" | "INPUT_GROUP";

  text?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "password" | "number" | "tel" | "url";
  style: IRStyle;
  children?: IRNode[];
}
