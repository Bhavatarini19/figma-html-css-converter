import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

function extractFileKeyFromUrl(url: string): string {
  const match = url.match(/figma\.com\/file\/([^\/\?&]+)/) || url.match(/figma\.com\/design\/([^\/\?&]+)/);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error(`Invalid Figma URL format. Expected URL like: https://www.figma.com/file/{FILE_KEY}/... or https://www.figma.com/design/{FILE_KEY}/...`);
}

function hasFlag(flag: string): boolean {
  const args = process.argv.slice(2);
  return args.includes(flag) || args.some(arg => arg.startsWith(`${flag}=`));
}

function getLocalJsonPath(): string | null {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--local-json" && i + 1 < args.length) {
      return args[i + 1];
    }
    if (args[i].startsWith("--local-json=")) {
      return args[i].substring("--local-json=".length);
    }
  }
  return null;
}

function getFileKey(): string {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--file-url=")) {
      let url = args[i].substring("--file-url=".length);
      if (!url.includes("figma.com")) {
        continue;
      }
      let j = i + 1;
      while (j < args.length && !args[j].startsWith("--") && (args[j].includes("=") || args[j].match(/^[a-zA-Z0-9_-]+$/))) {
        url += "&" + args[j];
        j++;
      }
      return extractFileKeyFromUrl(url);
    }
    if (args[i] === "--file-url" && i + 1 < args.length) {
      let url = args[i + 1];
      if (!url.includes("figma.com")) {
        continue;
      }
      let j = i + 2;
      while (j < args.length && !args[j].startsWith("--") && (args[j].includes("=") || args[j].match(/^[a-zA-Z0-9_-]+$/))) {
        url += "&" + args[j];
        j++;
      }
      return extractFileKeyFromUrl(url);
    }
    if (args[i] === "--file-id" && i + 1 < args.length) {
      return args[i + 1];
    }
    if (args[i].startsWith("--file-id=")) {
      return args[i].substring("--file-id=".length);
    }
    if (args[i] === "--file-key" && i + 1 < args.length) {
      return args[i + 1];
    }
    if (args[i].startsWith("--file-key=")) {
      return args[i].substring("--file-key=".length);
    }
  }

  const envKey = process.env.FIGMA_FILE_KEY;
  if (envKey) {
    if (envKey.startsWith("http")) {
      return extractFileKeyFromUrl(envKey);
    }
    return envKey;
  }

  throw new Error(
    "FIGMA_FILE_KEY or FIGMA_FILE_URL is required. Provide it via:\n" +
    "  1. Command-line with URL: npm start -- --file-url=\"https://www.figma.com/design/{FILE_KEY}/...\"\n" +
    "  2. Command-line with key: npm start -- --file-key <key>\n" +
    "  3. Environment variable: FIGMA_FILE_KEY=<key> or FIGMA_FILE_KEY=<url> in .env file\n" +
    "  4. Or set it directly: FIGMA_FILE_KEY=<key> npm start"
  );
}

const FIGMA_TOKEN: string = (process.env.FIGMA_TOKEN || process.env.FIGMA_API_KEY) as string;
const FIGMA_FILE_KEY: string = getFileKey();
const FIGMA_CACHE_DIR: string =
  (process.env.FIGMA_CACHE_DIR as string) || "./cache";

if (!FIGMA_TOKEN) {
  throw new Error(
    "FIGMA_TOKEN or FIGMA_API_KEY is required. Set it in .env file or as an environment variable:\n" +
    "  FIGMA_TOKEN=your_token_here\n" +
    "  or\n" +
    "  FIGMA_API_KEY=your_token_here"
  );
}

function getCachePath(): string {
  const safeKey = encodeURIComponent(FIGMA_FILE_KEY);
  return path.resolve(FIGMA_CACHE_DIR, `${safeKey}.json`);
}

export async function fetchFigmaFile(): Promise<any> {
  const localJsonPath = getLocalJsonPath();
  if (localJsonPath) {
    const resolvedPath = path.resolve(localJsonPath);
    if (fs.existsSync(resolvedPath)) {
      console.log(`Using local JSON file: ${resolvedPath}`);
      const raw = fs.readFileSync(resolvedPath, "utf-8");
      return JSON.parse(raw);
    } else {
      throw new Error(`Local JSON file not found: ${resolvedPath}`);
    }
  }

  const cachePath = getCachePath();
  const useCache = !hasFlag("--no-cache");

  if (useCache) {
    try {
      if (fs.existsSync(cachePath)) {
        console.log(`Using cached Figma JSON: ${cachePath}`);
        const raw = fs.readFileSync(cachePath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Failed to read Figma cache, will fall back to API:", err);
    }
  }

  console.log("Fetching Figma file from API...");

  const response = await axios.get(
    `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`,
    {
      headers: {
        "X-Figma-Token": FIGMA_TOKEN,
      },
    }
  );

  const data = response.data;

  if (useCache) {
    try {
      if (!fs.existsSync(FIGMA_CACHE_DIR)) {
        fs.mkdirSync(FIGMA_CACHE_DIR, { recursive: true });
      }

      const cachePathForLog = getCachePath();
      fs.writeFileSync(cachePathForLog, JSON.stringify(data, null, 2), "utf-8");
      console.log(`Cached Figma JSON to: ${cachePathForLog}`);
    } catch (err) {
      console.warn("Failed to write Figma cache file:", err);
    }
  }

  return data;
}
