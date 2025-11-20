import { IRNode } from "../types/ir";

function esc(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tagFor(node: IRNode): string {
    if (node.type === "TEXT") return "p";
    if (node.type === "BUTTON") return "button";
    if (node.type === "INPUT") return "input";
    if (node.type === "INPUT_GROUP") return "div";
    return "div";
}

function getInputAttributes(node: IRNode): string {
    if (node.type !== "INPUT") return "";

    const attrs: string[] = [];

    attrs.push(`type="${node.inputType || "text"}"`);

    if (node.placeholder) {
        attrs.push(`placeholder="${esc(node.placeholder)}"`);
    } else if (node.text) {
        const isActualContent = node.text.includes("@") || (node.text.length > 15);

        if (isActualContent) {
            attrs.push(`value="${esc(node.text)}"`);
        } else {
            attrs.push(`placeholder="${esc(node.text)}"`);
        }
    }

    if (node.name) {
        const name = node.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        attrs.push(`name="${name}"`);
    }

    return attrs.length > 0 ? " " + attrs.join(" ") : "";
}

function getButtonAttributes(node: IRNode): string {
    if (node.type !== "BUTTON") return "";
    return ' type="button"';
}

function renderNode(n: IRNode): string {
    const tag = tagFor(n);
    const cls = `node-${n.id.replace(/:/g, "_")}`;

    let attrs = ` class="${cls}"`;

    if (n.type === "INPUT") {
        attrs += getInputAttributes(n);
    } else if (n.type === "BUTTON") {
        attrs += getButtonAttributes(n);
    }

    if (tag === "input") {
        return `<${tag}${attrs} />`;
    }

    let html = `<${tag}${attrs}>`;

    if (n.type === "BUTTON" && n.text) {
        html += esc(n.text);
    } else if (n.type === "BUTTON" && n.children) {
        const textChildren = n.children.filter((c) => c.type === "TEXT");
        for (const textChild of textChildren) {
            if (textChild.text) {
                html += esc(textChild.text);
            }
        }
    } else if (n.type === "TEXT" && n.text) {
        html += esc(n.text);
    }

    if (n.children) {
        for (const c of n.children) {
            if (n.type === "BUTTON" && c.type === "TEXT") {
                continue;
            }
            if (n.type === "INPUT" && c.type === "TEXT") {
                continue;
            }
            html += renderNode(c);
        }
    }

    html += `</${tag}>`;
    return html;
}

export function renderHtml(root: IRNode): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Figma Output</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="artboard">
    ${renderNode(root)}
  </div>
</body>
</html>`;
}

