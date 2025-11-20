import { IRNode, IRStyle } from "../types/ir";

function cls(id: string) {
    return `.node-${id.replace(/:/g, "_")}`;
}

function decl(style: IRStyle, nodeType?: string, isShortText: boolean = false): string[] {
    const out: string[] = [];

    if (style.position) out.push(`position: ${style.position};`);
    if (style.left !== undefined) out.push(`left: ${style.left}px;`);
    if (style.top !== undefined) out.push(`top: ${style.top}px;`);
    if (style.zIndex !== undefined) out.push(`z-index: ${style.zIndex};`);

    if (style.width !== undefined && nodeType !== "TEXT") {
        out.push(`width: ${style.width}px;`);
    }
    if (style.height !== undefined) {
        out.push(`height: ${style.height}px;`);
    }

    if (style.boxSizing) out.push(`box-sizing: ${style.boxSizing};`);

    if (style.display) {
        if (nodeType === "TEXT" && style.display === "flex") {
            out.push(`display: block;`);
        } else {
            out.push(`display: ${style.display};`);
        }
    }

    if (style.flexDirection) out.push(`flex-direction: ${style.flexDirection};`);
    if (style.alignItems) out.push(`align-items: ${style.alignItems};`);
    if (style.justifyContent) out.push(`justify-content: ${style.justifyContent};`);
    if (style.gap !== undefined) out.push(`gap: ${style.gap}px;`);

    if (style.backgroundColor) out.push(`background-color: ${style.backgroundColor};`);

    if (style.backgroundImages && style.backgroundImages.length > 0) {
        const allBackgrounds = style.backgroundImage
            ? [style.backgroundImage, ...style.backgroundImages]
            : style.backgroundImages;
        out.push(`background-image: ${allBackgrounds.join(", ")};`);
        out.push(`background-size: cover;`);
    } else if (style.backgroundImage) {
        out.push(`background-image: ${style.backgroundImage};`);
        if (style.backgroundImage.includes("gradient")) {
            out.push(`background-size: cover;`);
        }
    }

    if (style.blendMode) out.push(`mix-blend-mode: ${style.blendMode};`);
    if (style.backgroundBlendMode) out.push(`background-blend-mode: ${style.backgroundBlendMode};`);

    if (style.opacity !== undefined) out.push(`opacity: ${style.opacity};`);

    if (style.color) out.push(`color: ${style.color};`);
    if (style.fontSize !== undefined) out.push(`font-size: ${style.fontSize}px;`);
    if (style.fontWeight !== undefined) out.push(`font-weight: ${style.fontWeight};`);
    if (style.fontFamily) {
        out.push(`font-family: "${style.fontFamily}", system-ui, -apple-system, sans-serif;`);
    }
    if (style.fontStyle) out.push(`font-style: ${style.fontStyle};`);
    if (style.textAlign) out.push(`text-align: ${style.textAlign};`);

    if (nodeType === "TEXT") {
        if (isShortText) {
            out.push("white-space: nowrap;");
            if (style.width !== undefined) out.push(`min-width: ${style.width}px;`);
        } else {
            out.push("white-space: normal;");
            if (style.width !== undefined) out.push(`max-width: ${style.width}px;`);
        }
    }

    if (style.verticalAlign && nodeType === "TEXT") {
        if ((style.verticalAlign === "middle" || style.verticalAlign === "center") && style.height && !style.lineHeight) {
            out.push(`line-height: ${style.height}px;`);
        }
    }

    if (style.letterSpacing !== undefined) out.push(`letter-spacing: ${style.letterSpacing}px;`);

    if (style.lineHeight !== undefined) {
        if (typeof style.lineHeight === "number") {
            out.push(`line-height: ${style.lineHeight}px;`);
        } else {
            out.push(`line-height: ${style.lineHeight};`);
        }
    }

    if (style.paddingTop !== undefined) out.push(`padding-top: ${style.paddingTop}px;`);
    if (style.paddingRight !== undefined) out.push(`padding-right: ${style.paddingRight}px;`);
    if (style.paddingBottom !== undefined) out.push(`padding-bottom: ${style.paddingBottom}px;`);
    if (style.paddingLeft !== undefined) out.push(`padding-left: ${style.paddingLeft}px;`);

    if (style.borderRadius !== undefined) {
        if (Array.isArray(style.borderRadius)) {
            out.push(`border-radius: ${style.borderRadius.map(x => `${x}px`).join(" ")};`);
        } else {
            out.push(`border-radius: ${style.borderRadius}px;`);
        }
    }

    if (style.borderWidth !== undefined && style.borderColor) {
        let borderStyle = style.borderStyle || "solid";

        if (style.borderDashPattern && style.borderDashPattern.length > 0) borderStyle = "dashed";

        out.push(`border: ${style.borderWidth}px ${borderStyle} ${style.borderColor};`);
    }

    if (style.borderTopWidth !== undefined && style.borderTopColor) {
        out.push(`border-top: ${style.borderTopWidth}px ${style.borderStyle || "solid"} ${style.borderTopColor};`);
    }
    if (style.borderRightWidth !== undefined && style.borderRightColor) {
        out.push(`border-right: ${style.borderRightWidth}px ${style.borderStyle || "solid"} ${style.borderRightColor};`);
    }
    if (style.borderBottomWidth !== undefined && style.borderBottomColor) {
        out.push(`border-bottom: ${style.borderBottomWidth}px ${style.borderStyle || "solid"} ${style.borderBottomColor};`);
    }
    if (style.borderLeftWidth !== undefined && style.borderLeftColor) {
        out.push(`border-left: ${style.borderLeftWidth}px ${style.borderStyle || "solid"} ${style.borderLeftColor};`);
    }

    const shadows: string[] = [];
    if (style.boxShadow) shadows.push(style.boxShadow);

    if (style.multipleStrokes && style.multipleStrokes.length > 0) {
        const strokeShadows = style.multipleStrokes.map((stroke) => {
            const offset = stroke.width;
            return `0 0 0 ${offset}px ${stroke.color}`;
        });
        shadows.push(...strokeShadows);
    }

    if (shadows.length > 0) out.push(`box-shadow: ${shadows.join(", ")};`);

    if (style.filter) out.push(`filter: ${style.filter};`);
    if (style.transform) out.push(`transform: ${style.transform};`);

    if (style.overflow) out.push(`overflow: ${style.overflow};`);
    if (style.clipPath) out.push(`clip-path: ${style.clipPath};`);

    return out;
}

function walk(n: IRNode, out: string[], parentType?: string) {
    if (parentType === "BUTTON" && n.type === "TEXT") return;

    let isShort = false;
    if (n.type === "TEXT" && n.text && n.text.length > 0 && n.text.length < 50 && !n.text.includes("\n")) {
        isShort = true;
    }

    const cssProps = decl(n.style, n.type, isShort);

    if (cssProps.length > 0) {
        out.push(`${cls(n.id)} { ${cssProps.join(" ")} }`);
    }

    if (n.type === "INPUT" && n.style.placeholderColor) {
        out.push(`${cls(n.id)}::placeholder { color: ${n.style.placeholderColor}; }`);
    }

    if (n.children) {
        n.children.forEach(c => walk(c, out, n.type));
    }
}

export function renderCss(root: IRNode): string {
    const out: string[] = [];

    const rootWidth = root.style.width || 393;
    const rootHeight = root.style.height || 852;

    const baseStyles = `* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
  background: #1e1e1e;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}
.artboard {
  position: relative;
  width: ${rootWidth}px;
  height: ${rootHeight}px;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}
input, button, p {
  margin: 0;
  padding: 0;
  font-family: inherit;
}
input {
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  color: inherit;
  width: 100%;
}
input::placeholder {
  color: inherit;
  opacity: 0.7;
}
button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: inherit;
  color: inherit;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: inherit;
  letter-spacing: inherit;
}
`;
    out.push(baseStyles);

    if (root.style.position === "absolute") {
        root.style.position = "relative";
        root.style.left = 0;
        root.style.top = 0;
    }

    walk(root, out, undefined);

    return out.join("\n");
}

