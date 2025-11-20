import { FigmaNode } from "../types/figma";
import { IRNode, IRStyle } from "../types/ir";

function rgba(p: any): string | undefined {
  if (!p?.color) return undefined;
  const { r, g, b, a } = p.color;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${a ?? 1})`;
}

function gradient(p: any): string | undefined {
  if (!p.gradientStops || p.gradientStops.length === 0) return undefined;

  const stops = p.gradientStops
    .map((s: any) => `${rgba({ color: s.color })} ${Math.round(s.position * 100)}%`)
    .join(", ");

  switch (p.type) {
    case "GRADIENT_LINEAR": {
      let angle = 180;

      if (p.gradientTransform && Array.isArray(p.gradientTransform) && p.gradientTransform.length >= 2) {
        const matrix = p.gradientTransform;
        if (matrix[0] && matrix[0].length >= 2) {
          const a = matrix[0][0];
          const b = matrix[0][1];
          angle = Math.atan2(b, a) * (180 / Math.PI);
          if (angle < 0) angle += 360;
        }
      } else if (p.gradientHandlePositions && p.gradientHandlePositions.length >= 2) {
        const start = p.gradientHandlePositions[0];
        const end = p.gradientHandlePositions[1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      }
      return `linear-gradient(${angle}deg, ${stops})`;
    }
    case "GRADIENT_RADIAL":
      return `radial-gradient(circle, ${stops})`;
    case "GRADIENT_ANGULAR":
      return `conic-gradient(${stops})`;
    case "GRADIENT_DIAMOND":
      return `radial-gradient(ellipse at center, ${stops})`;
    default:
      return `linear-gradient(180deg, ${stops})`;
  }
}

function extractEffects(n: FigmaNode): { boxShadow?: string; filter?: string } {
  const result: { boxShadow?: string; filter?: string } = {};

  if (!n.effects || n.effects.length === 0) return result;

  const shadows: string[] = [];
  let blur = "";

  for (const effect of n.effects) {
    if (!effect.visible) continue;

    switch (effect.type) {
      case "DROP_SHADOW":
      case "INNER_SHADOW": {
        const offsetX = effect.offset?.x || 0;
        const offsetY = effect.offset?.y || 0;
        const radius = effect.radius || 0;
        const spread = effect.spread || 0;
        const color = rgba({ color: effect.color });
        const inset = effect.type === "INNER_SHADOW" ? "inset " : "";
        shadows.push(
          `${inset}${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`
        );
        break;
      }
      case "LAYER_BLUR":
      case "BACKGROUND_BLUR":
        blur = `blur(${effect.radius || 0}px)`;
        break;
    }
  }

  if (shadows.length > 0) {
    result.boxShadow = shadows.join(", ");
  }
  if (blur) {
    result.filter = blur;
  }

  return result;
}

function extractStyle(n: FigmaNode, parentBox?: { x: number; y: number }): IRStyle {
  const st: IRStyle = {};

  const bounds = n.absoluteRenderBounds || n.absoluteBoundingBox;

  if (bounds) {
    const strokeWeight = n.strokeWeight || 0;
    const strokeAlign = n.strokeAlign || "CENTER";
    let width = bounds.width;
    let height = bounds.height;
    let left = bounds.x;
    let top = bounds.y;

    if (strokeAlign === "OUTSIDE" && strokeWeight > 0) {
      width = bounds.width + strokeWeight * 2;
      height = bounds.height + strokeWeight * 2;
      left = bounds.x - strokeWeight;
      top = bounds.y - strokeWeight;
    }

    if (n.type === "TEXT") {
      st.width = width;
      st.height = height;
    } else {
      st.width = width;
      st.height = height;
    }

    if (parentBox) {
      st.left = left - parentBox.x;
      st.top = top - parentBox.y;
    } else {
      st.left = left;
      st.top = top;
    }

    st.position = "absolute";
  }

  if (n.opacity !== undefined && n.opacity !== 1) {
    st.opacity = n.opacity;
  }

  if (n.rotation !== undefined && n.rotation !== 0) {
    const degrees = (n.rotation * 180) / Math.PI;
    st.transform = `rotate(${degrees}deg)`;
  }

  if (n.type !== "TEXT") {
    if (n.fills && n.fills.length > 0) {
      const backgroundLayers: string[] = [];
      let solidColor: string | undefined;

      for (const f of n.fills) {
        if (f.type === "SOLID") {
          const color = rgba(f);
          if (color) {
            if (!solidColor) {
              solidColor = color;
            } else {
              backgroundLayers.push(color);
            }
          }
        } else if (f.type.startsWith("GRADIENT")) {
          const grad = gradient(f);
          if (grad) {
            backgroundLayers.push(grad);
          }
        } else if (f.type === "IMAGE") {
        }
      }

      if (solidColor) {
        st.backgroundColor = solidColor;
      }
      if (backgroundLayers.length > 0) {
        st.backgroundImages = backgroundLayers;
      }
      if (!solidColor && backgroundLayers.length > 0) {
        st.backgroundImage = backgroundLayers[0];
        if (backgroundLayers.length > 1) {
          st.backgroundImages = backgroundLayers.slice(1);
        }
      }
    } else if (n.backgroundColor && n.backgroundColor.a > 0) {
      st.backgroundColor = rgba({ color: n.backgroundColor });
    }
  }

  if (n.blendMode && n.blendMode !== "NORMAL" && n.blendMode !== "PASS_THROUGH") {
    const blendModeMap: Record<string, string> = {
      MULTIPLY: "multiply",
      SCREEN: "screen",
      OVERLAY: "overlay",
      DARKEN: "darken",
      LIGHTEN: "lighten",
      COLOR_DODGE: "color-dodge",
      COLOR_BURN: "color-burn",
      HARD_LIGHT: "hard-light",
      SOFT_LIGHT: "soft-light",
      DIFFERENCE: "difference",
      EXCLUSION: "exclusion",
      HUE: "hue",
      SATURATION: "saturation",
      COLOR: "color",
      LUMINOSITY: "luminosity",
    };
    const cssBlendMode = blendModeMap[n.blendMode] || n.blendMode.toLowerCase();
    st.blendMode = cssBlendMode;
    if (st.backgroundImages && st.backgroundImages.length > 0) {
      st.backgroundBlendMode = cssBlendMode;
    }
  }

  if (n.strokes && n.strokes.length > 0) {
    const strokeWeight = n.strokeWeight || 1;
    const strokeAlign = n.strokeAlign || "CENTER";
    const strokeDashes = (n as any).strokeDashes;

    const multipleStrokes: Array<{ width: number; color: string; style?: string }> = [];

    for (let i = 0; i < n.strokes.length; i++) {
      const stroke = n.strokes[i];
      const strokeColor = rgba(stroke);
      if (!strokeColor) continue;

      if (i === 0) {
        st.borderColor = strokeColor;
        st.borderStyle = strokeDashes && strokeDashes.length > 0 ? "dashed" : "solid";
        st.borderWidth = strokeWeight;

        if (strokeDashes && strokeDashes.length > 0) {
          st.borderDashPattern = strokeDashes;
        }

        if (strokeAlign === "INSIDE") {
          st.boxSizing = "border-box";
        }
      } else {
        multipleStrokes.push({
          width: strokeWeight,
          color: strokeColor,
          style: strokeDashes && strokeDashes.length > 0 ? "dashed" : "solid",
        });
      }
    }

    if (multipleStrokes.length > 0) {
      st.multipleStrokes = multipleStrokes;
    }
  }

  if (n.rectangleCornerRadii && n.rectangleCornerRadii.length === 4) {
    st.borderRadius = n.rectangleCornerRadii;
  } else if (typeof n.cornerRadius === "number") {
    st.borderRadius = n.cornerRadius;
  }

  if (n.layoutMode === "HORIZONTAL" || n.layoutMode === "VERTICAL") {
    st.display = "flex";
    st.flexDirection = n.layoutMode === "HORIZONTAL" ? "row" : "column";

    if (n.itemSpacing !== undefined) st.gap = n.itemSpacing;

    if (n.paddingLeft !== undefined) st.paddingLeft = n.paddingLeft;
    if (n.paddingRight !== undefined) st.paddingRight = n.paddingRight;
    if (n.paddingTop !== undefined) st.paddingTop = n.paddingTop;
    if (n.paddingBottom !== undefined) st.paddingBottom = n.paddingBottom;
  } else {
    if (n.paddingLeft !== undefined) st.paddingLeft = n.paddingLeft;
    if (n.paddingRight !== undefined) st.paddingRight = n.paddingRight;
    if (n.paddingTop !== undefined) st.paddingTop = n.paddingTop;
    if (n.paddingBottom !== undefined) st.paddingBottom = n.paddingBottom;
  }

  if (n.style) {
    if (n.style.fontSize !== undefined) st.fontSize = n.style.fontSize;
    if (n.style.fontWeight !== undefined) st.fontWeight = n.style.fontWeight;
    if (n.style.fontFamily) st.fontFamily = n.style.fontFamily;
    if (n.style.fontStyle) st.fontStyle = n.style.fontStyle;

    if (n.style.textAlignHorizontal) {
      const align = n.style.textAlignHorizontal.toLowerCase();
      st.textAlign = align === "justified" ? "justify" : align;
    }

    if (n.style.textAlignVertical) {
      const vAlign = n.style.textAlignVertical.toLowerCase();
      if (vAlign === "center") {
        st.verticalAlign = "middle";
      } else {
        st.verticalAlign = vAlign;
      }
    }

    if (n.style.letterSpacing !== undefined) {
      st.letterSpacing = n.style.letterSpacing;
    }

    if (n.style.lineHeightUnit === "AUTO" || n.style.lineHeightUnit === "AUTO_HEIGHT") {
      st.lineHeight = "normal";
    } else if (n.style.lineHeightPx !== undefined) {
      st.lineHeight = n.style.lineHeightPx;
    } else if (n.style.lineHeightPercentFontSize !== undefined && n.style.fontSize) {
      st.lineHeight = (n.style.lineHeightPercentFontSize / 100) * n.style.fontSize;
    } else if (n.style.lineHeightPercent !== undefined) {
      st.lineHeight = `${n.style.lineHeightPercent}%`;
    }
  }

  if (n.type === "TEXT" && n.fills && n.fills.length > 0) {
    const textFill = n.fills[0];
    if (textFill.type === "SOLID") {
      st.color = rgba(textFill);
    } else if (textFill.type === "GRADIENT_LINEAR" || textFill.type === "GRADIENT_RADIAL") {
      if (textFill.gradientStops && textFill.gradientStops.length > 0) {
        st.color = rgba({ color: textFill.gradientStops[0].color });
      }
    }
  }

  const effects = extractEffects(n);
  if (effects.boxShadow) st.boxShadow = effects.boxShadow;

  if ((n as any).clipsContent !== undefined) {
    if ((n as any).clipsContent === true) {
      st.overflow = "hidden";
    }
  }

  return st;
}

function isButton(n: FigmaNode): boolean {
  const nameLower = n.name?.toLowerCase() || "";
  const hasButtonName = nameLower.includes("button") ||
    nameLower.includes("btn") ||
    nameLower.includes("submit") ||
    nameLower.includes("action");

  const hasGradient =
    (n.fills?.some((f: any) => f.type?.startsWith("GRADIENT")) ||
      (n as any).background?.some((f: any) => f.type?.startsWith("GRADIENT"))) ??
    false;

  const hasRoundedCorners =
    ((n.cornerRadius && n.cornerRadius > 0) ||
      (n.rectangleCornerRadii?.some((r) => r > 0))) ??
    false;

  const hasSolidBackground =
    (n.fills?.some((f: any) => f.type === "SOLID") ||
      (n.backgroundColor && n.backgroundColor.a > 0)) ??
    false;

  const hasSingleTextChild = n.children?.length === 1 &&
    n.children[0]?.type === "TEXT";

  const hasPadding = (n.paddingLeft || n.paddingRight || n.paddingTop || n.paddingBottom) !== undefined;

  const isPrimaryButton = hasGradient && hasRoundedCorners;
  const isSecondaryButton = hasSolidBackground && hasRoundedCorners && hasSingleTextChild;
  const isNamedButton = hasButtonName && hasRoundedCorners && (hasPadding || hasSingleTextChild);

  return isPrimaryButton || isSecondaryButton || isNamedButton;
}

function isInput(n: FigmaNode): boolean {
  const nameLower = n.name?.toLowerCase() || "";
  const hasInputName = nameLower.includes("input") ||
    nameLower.includes("field") ||
    nameLower.includes("textfield") ||
    nameLower.includes("text field");

  const hasBorder = (n.strokes && n.strokes.length > 0) ?? false;

  const hasRoundedCorners =
    ((n.cornerRadius && n.cornerRadius > 0) ||
      (n.rectangleCornerRadii?.some((r) => r > 0))) ??
    false;

  const hasPadding = (n.paddingLeft || n.paddingRight || n.paddingTop || n.paddingBottom) !== undefined;

  const hasTextChild = n.children?.some((child) => child.type === "TEXT") ?? false;

  const hasLayout = n.layoutMode !== undefined;

  const isTypicalInput = hasBorder && hasRoundedCorners && hasPadding;
  const isNamedInput = hasInputName && hasBorder;
  const isInputWithPlaceholder = hasBorder && hasRoundedCorners && hasTextChild && hasLayout;

  return isTypicalInput || isNamedInput || isInputWithPlaceholder;
}

function detectInputType(n: FigmaNode): "text" | "email" | "password" | "number" | "tel" | "url" | undefined {
  const nameLower = n.name?.toLowerCase() || "";
  const textContent = n.children
    ?.find((c) => c.type === "TEXT")
    ?.characters?.toLowerCase() || "";

  if (nameLower.includes("email") || textContent.includes("email") || textContent.includes("@")) {
    return "email";
  }
  if (nameLower.includes("password") || textContent.includes("password")) {
    return "password";
  }
  if (nameLower.includes("phone") || nameLower.includes("tel") || textContent.includes("phone")) {
    return "tel";
  }
  if (nameLower.includes("number") || nameLower.includes("num")) {
    return "number";
  }
  if (nameLower.includes("url") || textContent.includes("url")) {
    return "url";
  }

  return "text";
}

function isPlaceholderText(text: string): boolean {
  if (!text || text.length === 0) return false;

  const textLower = text.toLowerCase();
  const placeholderPatterns = [
    "email",
    "password",
    "username",
    "name",
    "phone",
    "search",
    "enter",
    "type",
    "input",
    "confirm password",
    "re-enter",
  ];

  const matchesPattern = placeholderPatterns.some((pattern) =>
    textLower === pattern ||
    (textLower.includes(pattern) && text.length < 25)
  );

  const isActualContent = text.includes("@") && text.length > 10;

  return matchesPattern && !isActualContent;
}

function extractPlaceholder(n: FigmaNode): string | undefined {
  if (!n.children) return undefined;

  for (const child of n.children) {
    if (child.type === "TEXT" && child.characters) {
      const text = child.characters;

      if (isPlaceholderText(text)) {
        return text;
      }
    }
  }
  return undefined;
}

function classifyType(n: FigmaNode, analyzedChildren?: IRNode[], isRoot: boolean = false): IRNode["type"] {
  if (n.type === "TEXT") return "TEXT";

  if (isRoot) {
    return "FRAME";
  }

  if (isButton(n)) {
    return "BUTTON";
  }

  if (isInput(n)) {
    return "INPUT";
  }

  if (analyzedChildren) {
    const inputCount = analyzedChildren.filter((c) => c.type === "INPUT").length;
    if (inputCount >= 2) {
      return "INPUT_GROUP";
    }
  }

  return "FRAME";
}

export function figmaNodeToIR(
  n: FigmaNode,
  parentBox?: { x: number; y: number },
  isRoot: boolean = false
): IRNode {
  const bounds = n.absoluteRenderBounds || n.absoluteBoundingBox;
  const currentBox = bounds ? { x: bounds.x, y: bounds.y } : parentBox;

  const children: IRNode[] = [];
  if (n.children) {
    for (const c of n.children) {
      children.push(figmaNodeToIR(c, currentBox, false));
    }
  }

  const nodeType = classifyType(n, children, isRoot);

  const ir: IRNode = {
    id: n.id,
    name: n.name,
    type: nodeType,
    style: extractStyle(n, parentBox),
    children: children.length > 0 ? children : undefined,
  };

  if (n.characters) {
    ir.text = n.characters;
  }

  if (nodeType === "INPUT") {
    ir.inputType = detectInputType(n);
    const textChildNode = n.children?.find((c) => c.type === "TEXT");
    const textContent = textChildNode?.characters;

    if (textContent) {
      const extractedPlaceholder = extractPlaceholder(n);

      if (extractedPlaceholder) {
        ir.placeholder = extractedPlaceholder;

        if (textChildNode && textChildNode.fills && textChildNode.fills.length > 0) {
          const textFill = textChildNode.fills[0];
          if (textFill.type === "SOLID") {
            const placeholderColor = rgba(textFill);
            if (placeholderColor) {
              ir.style.placeholderColor = placeholderColor;
            }
          }
        }
      } else if (textContent.includes("@") || (textContent.length > 10 && !isPlaceholderText(textContent))) {
        ir.text = textContent;
      } else {
        const textLower = textContent.toLowerCase();
        const placeholderPatterns = ["email", "password", "username", "name", "phone", "search", "enter", "type", "input"];
        const isPlaceholder = placeholderPatterns.some((pattern) =>
          textLower === pattern || (textLower.includes(pattern) && textContent.length < 20)
        );

        if (isPlaceholder) {
          ir.placeholder = textContent;
        } else {
          ir.placeholder = textContent;
        }
      }
    } else {
      ir.placeholder = extractPlaceholder(n);
    }
  }

  if (nodeType === "BUTTON" || nodeType === "INPUT") {
    let textChild = children.find((c) => c.type === "TEXT");

    if (!textChild && n.children) {
      const figmaTextChild = n.children.find((c) => c.type === "TEXT");
      if (figmaTextChild) {
        const textStyle = extractStyle(figmaTextChild, parentBox);
        if (textStyle.fontSize !== undefined && ir.style.fontSize === undefined) {
          ir.style.fontSize = textStyle.fontSize;
        }
        if (textStyle.fontWeight !== undefined && ir.style.fontWeight === undefined) {
          ir.style.fontWeight = textStyle.fontWeight;
        }
        if (textStyle.fontFamily && !ir.style.fontFamily) {
          ir.style.fontFamily = textStyle.fontFamily;
        }
        if (textStyle.fontStyle && !ir.style.fontStyle) {
          ir.style.fontStyle = textStyle.fontStyle;
        }
        if (textStyle.color && !ir.style.color) {
          ir.style.color = textStyle.color;
        }
        if (textStyle.textAlign && !ir.style.textAlign) {
          ir.style.textAlign = textStyle.textAlign;
        }
        if (textStyle.letterSpacing !== undefined && ir.style.letterSpacing === undefined) {
          ir.style.letterSpacing = textStyle.letterSpacing;
        }
        if (textStyle.lineHeight !== undefined && ir.style.lineHeight === undefined) {
          ir.style.lineHeight = textStyle.lineHeight;
        }
      }
    } else if (textChild && textChild.style) {
      if (textChild.style.fontSize !== undefined && ir.style.fontSize === undefined) {
        ir.style.fontSize = textChild.style.fontSize;
      }
      if (textChild.style.fontWeight !== undefined && ir.style.fontWeight === undefined) {
        ir.style.fontWeight = textChild.style.fontWeight;
      }
      if (textChild.style.fontFamily && !ir.style.fontFamily) {
        ir.style.fontFamily = textChild.style.fontFamily;
      }
      if (textChild.style.fontStyle && !ir.style.fontStyle) {
        ir.style.fontStyle = textChild.style.fontStyle;
      }
      if (textChild.style.color && !ir.style.color) {
        ir.style.color = textChild.style.color;
      }
      if (textChild.style.textAlign && !ir.style.textAlign) {
        ir.style.textAlign = textChild.style.textAlign;
      }
      if (textChild.style.letterSpacing !== undefined && ir.style.letterSpacing === undefined) {
        ir.style.letterSpacing = textChild.style.letterSpacing;
      }
      if (textChild.style.lineHeight !== undefined && ir.style.lineHeight === undefined) {
        ir.style.lineHeight = textChild.style.lineHeight;
      }
    }
  }

  return ir;
}
