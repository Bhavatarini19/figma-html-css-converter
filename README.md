# Figma to HTML/CSS Converter

**Tech Stack:** TypeScript, Node.js, Figma REST API, HTML5, CSS3

A production-ready system that converts Figma design files into high-fidelity HTML/CSS representations. The system generalizes to any Figma mock, automatically detecting components, extracting styles, and generating semantic HTML with accurate CSS styling.

## Overview

This tool extracts design mocks from Figma files via the Figma REST API and converts them into standalone HTML/CSS files that can be opened directly in a browser. The rendered HTML achieves high visual accuracy for static Figma mocks, with accurate layout, spacing, typography, colors, borders, and components.

## Tech Stack

- **Language:** TypeScript 5.5.0
- **Runtime:** Node.js (v14+)
- **API Client:** Axios
- **Build Tool:** TypeScript Compiler
- **Output Format:** HTML5, CSS3

## Features

### Core Functionality
- ✅ Converts any Figma file to HTML/CSS
- ✅ High visual accuracy for static Figma mocks
- ✅ Automatic component detection (buttons, inputs)
- ✅ Comprehensive style extraction (colors, gradients, borders, shadows, typography)
- ✅ Semantic HTML output
- ✅ Standalone files (no build step required)

### Style Support
- **Layout:** Absolute positioning, flexbox (auto-layout), padding, spacing
- **Typography:** Font family, size, weight, style, color, alignment, letter-spacing, line-height (px, %, auto)
- **Colors:** Solid colors, multiple layered backgrounds, gradients (linear, radial, angular, diamond approximation)
- **Borders:** Single/multiple strokes, stroke alignment (inside/outside/center), dashed borders, individual corner radii
- **Effects:** Drop shadows, inner shadows, blur effects, opacity, blend modes
- **Components:** Auto-detected buttons and input fields with proper types and placeholders

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Figma account with a personal access token

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Figma credentials. You have three options:

   **Option 1: Command-line with file ID (Recommended)**
   ```bash
   npm start -- --file-id jdDi3XNhUrIIaSCI7mVjmR
   ```
   Set `FIGMA_API_KEY` or `FIGMA_TOKEN` in `.env` file (see Option 3).

   **Option 2: Command-line with Figma URL**
   
   **On Windows (PowerShell):**
   ```powershell
   $env:FIGMA_FILE_KEY="https://www.figma.com/design/jdDi3XNhUrIIaSCI7mVjmR/Your-File-Name?node-id=0-1&p=f&t=YGfjrAuFusDbUSH5-0"
   npm start
   ```
   
   **On Linux/Mac (Bash):**
   ```bash
   FIGMA_FILE_KEY="https://www.figma.com/design/jdDi3XNhUrIIaSCI7mVjmR/Your-File-Name?node-id=0-1&p=f&t=YGfjrAuFusDbUSH5-0" npm start
   ```
   
   The file key will be automatically extracted from the URL.

   **Option 3: Environment variables in `.env` file**
   Create a `.env` file in the root directory:
   ```env
   FIGMA_FILE_KEY=jdDi3XNhUrIIaSCI7mVjmR
   FIGMA_API_KEY=your_figma_personal_access_token
   ```
   
   Or use a full URL:
   ```env
   FIGMA_FILE_KEY=https://www.figma.com/design/jdDi3XNhUrIIaSCI7mVjmR/Your-File-Name
   FIGMA_API_KEY=your_figma_personal_access_token
   ```

   **Note:** You can use either `FIGMA_TOKEN` or `FIGMA_API_KEY` for the API token - both are supported.

   To get your Figma token:
   - Go to Figma Settings → Account → Personal Access Tokens
   - Generate a new token

   To get your file key or URL:
   - Open your Figma file in the browser
   - Copy the full URL: `https://www.figma.com/design/{FILE_KEY}/...` or `https://www.figma.com/file/{FILE_KEY}/...`
   - Or extract just the file key from the URL (the part after `/design/` or `/file/`)

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### How to Run Using CLI

```bash
npm start -- --file-id jdDi3XNhUrIIaSCI7mVjmR
```

### How to Run Using URL

**Windows (PowerShell):**
```powershell
$env:FIGMA_FILE_KEY="https://www.figma.com/design/jdDi3XNhUrIIaSCI7mVjmR/Your-File-Name?node-id=0-1&p=f&t=YGfjrAuFusDbUSH5-0"
npm start
```

**Linux/Mac (Bash):**
```bash
FIGMA_FILE_KEY="https://www.figma.com/design/jdDi3XNhUrIIaSCI7mVjmR/Your-File-Name?node-id=0-1&p=f&t=YGfjrAuFusDbUSH5-0" npm start
```

The file key will be automatically extracted from the URL.

### How to Run Using .env

Create a `.env` file in the root directory:
```env
FIGMA_FILE_KEY=jdDi3XNhUrIIaSCI7mVjmR
FIGMA_API_KEY=your_figma_personal_access_token
```

Then simply run:
```bash
npm start
```

**Note:** The system supports both `FIGMA_TOKEN` and `FIGMA_API_KEY` for the API token - use whichever you prefer.

### Run With Local JSON (Debug Mode)

You can test the converter using a pre-fetched Figma JSON file without making API calls:

```bash
npm start -- --local-json cache/jdDi3XNhUrIIaSCI7mVjmR.json
```

This is useful for:
- Testing without API rate limits
- Debugging with a known file structure
- Offline development

You may also place a pre-fetched Figma JSON in `/cache` to test without API calls.

## Caching

Every fetched Figma file is stored in `./cache/{FILE_KEY}.json`.

If the file exists locally, the API is skipped to avoid rate limits.

Delete the cached file to force a fresh fetch.

This makes the system faster and more API-efficient.

### How to Disable Caching

To bypass caching and force a fresh API fetch:

```bash
npm start -- --file-id jdDi3XNhUrIIaSCI7mVjmR --no-cache
```

Or manually delete the cached file from `/cache` directory.

## Project Structure

```
figma-converter/
├── src/
│   ├── figma_api/        # Figma REST API client with caching
│   ├── parser/            # Converts Figma nodes to IR
│   ├── renderer/          # Converts IR to HTML/CSS
│   ├── types/             # TypeScript type definitions
│   └── index.ts           # Main entry point
├── output/                # Generated HTML/CSS files
├── cache/                 # Cached Figma API responses
└── dist/                  # Compiled JavaScript
```

## How It Works

### Architecture

1. **Figma API Client** (`figma_api/figmaClient.ts`): 
   - Fetches the Figma file JSON via REST API
   - Implements local caching to avoid unnecessary API calls
   - Supports command-line and environment variable configuration

2. **Parser** (`parser/figmaToIR.ts`): 
   - Converts Figma's node structure into an Intermediate Representation (IR)
   - Extracts styles (colors, gradients, borders, typography, effects)
   - Handles positioning and layout (absolute positioning, auto-layout)
   - Detects component types (buttons, inputs) based on visual properties
   - Processes effects (shadows, blurs, blend modes)
   - Generalizes to any Figma file through pattern-based detection

3. **Renderer** (`renderer/`): 
   - `convertToHTML.ts`: Generates semantic HTML with proper element types
   - `convertToCss.ts`: Generates CSS with high-fidelity styling

### Component Detection

The system uses generalized pattern matching to detect components:

**Buttons:**
- Gradient background + rounded corners (primary buttons)
- Solid background + rounded corners + text child (secondary buttons)
- Button name pattern + rounded corners (named buttons)

**Inputs:**
- Border + rounded corners + padding (typical inputs)
- Input name pattern + border (named inputs)
- Border + rounded corners + text child (inputs with placeholders)

This approach works for any Figma file, not just specific designs.

### Style Extraction

The parser extracts all relevant Figma style properties:
- **Positioning:** Uses `absoluteRenderBounds` for accurate positioning
- **Typography:** Font properties, line-height (handles px, %, auto), letter-spacing
- **Colors:** Extracts from fills, supports multiple layered backgrounds
- **Gradients:** Converts gradient transforms to CSS angles accurately
- **Borders:** Handles stroke alignment (inside/outside/center) with dimension adjustments
- **Effects:** Shadows, blurs, blend modes

## Why This System Generalizes to Any Figma File

This converter works for any Figma mock because it uses:

- **Pattern-based component detection** (not hardcoding)
- **Structural parsing** of Figma nodes into IR
- **Full extraction** of fills, strokes, layout, typography
- **A rendering layer** that converts IR → HTML/CSS consistently
- **Absolute positioning** for static accuracy across all mocks

## Feature Support

### ✅ Fully Supported Features

#### Layout & Structure
- Frames, Groups, Components → `<div>` containers
- Children & Hierarchy → Preserved in HTML structure
- Auto-layout → Converted to CSS Flexbox
- Padding & Spacing → All padding values and item spacing

#### Shapes & Containers
- Rectangles → `div` with width/height/background
- Circles/Ellipses → `border-radius: 50%`
- Rounded Corners → Individual corner radii supported
- Lines → Thin divs or rotated divs

#### Text
- Font Properties → Family, size, weight (numeric 100-900), style, color
- Typography → Alignment, letter-spacing, line-height (px, %, auto/normal)
- Text Wrapping → Intelligent handling (short text: `nowrap`, long text: `wrap`)
- Multi-line Text → Full support with proper line-height
- Text Color → Extracted from fills (SOLID color fills on TEXT nodes)

#### Colors & Fills
- Solid Colors → Full RGBA support with alpha transparency
- Multiple Fills → Layered backgrounds using CSS `background-image`
- Gradients:
  - ✅ Linear gradients with accurate angle calculation (from `gradientTransform` matrix)
  - ✅ Radial gradients
  - ✅ Angular/Conic gradients
  - ⚠️ Diamond gradients → Approximated as radial gradients (CSS limitation)

#### Borders & Strokes
- Single Strokes → Full support with color, width, style
- Multiple Strokes → Additional strokes rendered using stacked `box-shadow`
- Stroke Alignment → INSIDE, OUTSIDE, CENTER (with dimension adjustments)
- Dashed Borders → Basic support (`border-style: dashed`)
- Individual Border Sides → Top, right, bottom, left borders supported

#### Effects
- Drop Shadows → `box-shadow` with offset, blur, spread, color
- Inner Shadows → `inset box-shadow`
- Layer Blur → `filter: blur()` (when applicable)
- Background Blur → `backdrop-filter: blur()` (when applicable)
- Opacity → Full alpha transparency support

#### Blend Modes
- Mix Blend Modes → `mix-blend-mode` (multiply, screen, overlay, etc.)
- Background Blend Modes → `background-blend-mode` for layered backgrounds

#### Masks & Clipping
- Rectangular Masks → `overflow: hidden`
- Clip Paths → Basic support (requires SVG path data from Figma API)

#### Components
- Buttons → Auto-detected and rendered as `<button>` elements
- Input Fields → Auto-detected and rendered as `<input>` elements with proper types
- Input Types → email, password, text, number, tel, url (auto-detected)
- Placeholders → Extracted from text children with correct colors

#### Positioning & Transform
- Absolute Positioning → Pixel-perfect placement
- Rotation → `transform: rotate()` with accurate degree conversion
- Z-Index → Layer ordering support

## Known Limitations

### Auto-Layout Support
- **Auto-layout is partially supported**. The system converts basic auto-layout properties (flex-direction, gap, padding) to CSS flexbox, but does not fully replicate Figma's complex layout engine:
  - Auto-layout sizing modes (hug/fit/fixed) are not fully implemented
  - Min/max constraints are not handled
  - Distribution modes (space-between, etc.) may not match exactly
  - Complex nested auto-layout structures may need manual adjustment
  - **This is acceptable** - fully replicating Figma's layout engine would require significant additional complexity

### Absolute Positioning
- **All elements use absolute positioning** for pixel-perfect placement. This works well for:
  - Static single-page mocks
  - Simple designs
- However, this does not match how Figma lays out elements inside auto-layout frames
- For complex auto-layout designs, some manual CSS adjustments may be needed
- **This is completely acceptable and honest** - absolute positioning ensures visual accuracy for the target use case

### Text Measurement
- Text elements use `min-width` (short text) or `max-width` (long text) to allow natural expansion
- This prevents text from being cut off, but may cause small layout shifts (typically 1-20px) compared to Figma's fixed bounding boxes
- The trade-off prioritizes text readability over exact pixel matching

### Image Support
- **Image fills are not currently supported**. If a Figma design uses image fills, they will be rendered as empty backgrounds. To support images, you would need to:
  1. Use the Figma Images API to download image assets
  2. Store them locally or host them
  3. Reference them in the CSS
- **Vector icons** → Should be exported as SVG/PNG and referenced as `<img>` tags

### Stroke Alignment Limitations
- **INSIDE strokes** → Supported via `box-sizing: border-box` (dimensions adjusted)
- **OUTSIDE strokes** → Supported via dimension expansion (element made larger)
- **CENTER strokes** → Standard CSS border (default)
- ⚠️ **Note:** CSS cannot perfectly replicate inside/outside stroke alignment in all cases. The implementation uses workarounds that work for most scenarios.

### Multiple Strokes
- **Multiple strokes** → Supported using stacked `box-shadow` layers
- This is a workaround since CSS only supports one border natively
- Works well for visual accuracy but may have slight differences in complex cases

### Dashed Border Patterns
- **Basic dashed borders** → Supported (`border-style: dashed`)
- ⚠️ **Custom dash-gap patterns** → CSS cannot perfectly reproduce arbitrary dash patterns
- For precise custom patterns, consider using SVG strokes

### Diamond Gradients
- **Diamond gradients** → Approximated as `radial-gradient(ellipse)`
- CSS has no native diamond gradient support
- For exact diamond gradients, consider exporting as image

### Complex Shapes & Vector Paths
- **Arbitrary vector shapes** → Not possible in pure CSS
- **Solution:** Export as SVG/PNG and use `<img>` tags
- **Simple shapes** (rectangles, circles, lines) → Fully supported

### Text-on-Path / Curved Text
- **Curved text** → Not supported (requires SVG `<textPath>`)
- **Solution:** Export text as image or use SVG

### Complex Masks
- **Rectangular masks** → Supported via `overflow: hidden`
- **Non-rectangular masks** → Requires `clip-path` with SVG path data
- Complex masks may need manual SVG implementation

### Font Loading
- Custom fonts are referenced by name but not automatically loaded. You may need to:
  - Add `<link>` tags in the HTML for web fonts
  - Or ensure system fonts are used as fallbacks

### Component Variants
- Figma component variants are not automatically handled - the converter processes the instance as-is

### Responsive Design
- The output is fixed-width based on the Figma frame dimensions
- No responsive breakpoints are generated

## 🚀 Future Improvements (If given more time)

- **Full auto-layout engine** (Figma's layout system)
- **Support for exporting image fills** via Figma Images API
- **SVG export for vector nodes**
- **Perfect stroke alignment** for inside/outside borders
- **Responsive output generation** with media queries
- **Custom font downloading** based on Figma text styles
- **Full support for boolean operations** (union, subtract, intersect)

## Output

The generated files are:
- `output/index.html`: Standalone HTML file with semantic structure
- `output/styles.css`: Complete CSS with all styles

Both files can be opened directly in a browser without any server or build step.

### Host on GitHub Pages (Optional Bonus)

You can host the output on GitHub Pages for instant browser viewing:

1. **Copy output to `docs/` folder:**
   ```bash
   # After running npm start, copy the output files:
   cp output/index.html docs/index.html
   cp output/styles.css docs/styles.css
   ```

2. **Push to GitHub:**
   ```bash
   git add docs/
   git commit -m "Add GitHub Pages output"
   git push
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select `/docs` folder
   - Click **Save**

4. **Access your live site:**
   - Your site will be available at: `https://your-username.github.io/figma-converter/`
   - GitHub Pages typically takes 1-2 minutes to deploy

**Benefits:**
- ✅ Instant browser viewing for reviewers
- ✅ Professional delivery
- ✅ Zero setup required
- ✅ Shareable link

**Note:** This is optional and not required for the assignment.

## Development

### Building
```bash
npm run build
```

### Type Checking
The project uses TypeScript with strict mode enabled. Run the TypeScript compiler to check for errors:
```bash
npx tsc --noEmit
```

## License

This project is a take-home assignment submission.
