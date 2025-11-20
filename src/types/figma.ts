export interface FigmaNode {
  id: string;
  name: string;
  type: string;

  children?: FigmaNode[];

  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  absoluteRenderBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  fills?: {
    type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND" | string;
    color?: { r: number; g: number; b: number; a: number };
    gradientStops?: {
      color: { r: number; g: number; b: number; a: number };
      position: number;
    }[];
    gradientHandlePositions?: Array<{ x: number; y: number }>;
    gradientTransform?: number[][];
  }[];

  strokes?: {
    type: "SOLID" | string;
    color?: { r: number; g: number; b: number; a: number };
  }[];
  strokeDashes?: number[];

  strokeWeight?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";

  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  cornerSmoothing?: number;

  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  characters?: string;

  style?: {
    fontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
    fontPostScriptName?: string;
    fontStyle?: string;
    textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
    textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
    letterSpacing?: number;
    lineHeightPx?: number;
    lineHeightPercent?: number;
    lineHeightPercentFontSize?: number;
    lineHeightUnit?: string;
  };

  opacity?: number;
  blendMode?: string;
  rotation?: number;

  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };

  effects?: Array<{
    type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
    visible?: boolean;
    color?: { r: number; g: number; b: number; a: number };
    offset?: { x: number; y: number };
    radius?: number;
    spread?: number;
  }>;

  layoutAlign?: string;
  layoutGrow?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;

  [key: string]: any;
}
