# 🌲 Bigfoot Sightings Atlas

**An interactive map exploring reported Bigfoot sightings across the United States.**

Built for the **#30DayMapChallenge 2026 — Day 1: Points**.

Explore thousands of reported Bigfoot encounters through an interactive map featuring spatial clustering, state-level visualization, historical reports, and animated pixel-art characters.

🔗 **[Explore the Interactive Map](https://fdo-alo.github.io/bigfoot-map/)**

## 🗺️ Features

- **Interactive map:** Explore geocoded Bigfoot sighting reports across the United States.
- **Spatial clustering:** Nearby sightings are grouped dynamically according to the map's zoom level.
- **State-level visualization:** State boundaries are styled using the number of reported sightings.
- **Case files:** Select individual sightings or clusters to browse reports, dates, locations, classifications, and witness testimony.
- **Text-to-speech narration:** Listen to witness accounts using browser-based speech synthesis, with male and female voice preferences.
- **Animated Bigfoot:** A pixel-art character accompanies the case files, with multiple animations and orientations.
- **Responsive interface:** Designed for desktop and mobile browsers.

## 📊 Dataset

The project uses the [Bigfoot Sightings dataset on Kaggle](https://www.kaggle.com/datasets/mexwell/bigfoot-sightings), containing reports associated with the Bigfoot Field Researchers Organization (BFRO).

| Metric | Count |
|---|---:|
| Total sighting reports | 5,082 |
| Reports with geographic coordinates | 4,104 |
| Reports without coordinates | 978 |

Only geocoded reports are displayed as map points. State-level counts can include reports that do not have geographic coordinates.

**Data limitations:** These records represent reported encounters, not independently verified evidence of Bigfoot. Geographic coordinates may be approximate, and the dataset may contain spatial, temporal, and reporting biases.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface and state management |
| TypeScript | Application logic and type safety |
| Vite | Development and production builds |
| MapLibre GL JS | Interactive cartography and point clustering |
| GeoJSON | Geographic data representation |
| Python / GeoPandas | Data processing and geospatial preparation |
| QGIS | Geographic data inspection and validation |
| Web Speech API | Browser-based text-to-speech narration |
| CSS | Responsive layout, visual styling, and sprite rendering |
| GitHub Pages | Static application hosting |

## 🚀 Getting Started

### Prerequisites

- Node.js (version 24 recommended)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/bigfoot-map.git
cd bigfoot-map
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite.

### Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```text
bigfoot-map/
├── public/
│   ├── data/             # Geographic datasets
│   ├── images/           # Bigfoot map icons
│   └── sprites/          # Pixel-art sprite sheets
├── src/
│   ├── components/       # Map, case dialog, and animation components
│   ├── services/         # Animation logic
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Shared utilities
├── .github/
│   └── workflows/        # GitHub Pages deployment
├── index.html
├── package.json
└── vite.config.ts
```

## 🌐 Deployment

The application is designed for deployment to **GitHub Pages** through GitHub Actions.

Vite uses the repository base path:

```typescript
base: "/bigfoot-map/"
```

Static assets are served from the `public/` directory. Paths must account for the configured Vite base URL when deployed.

The deployment workflow builds the application and publishes the resulting `dist/` directory.

## 🎨 Design

The visual design combines a forest-inspired cartographic palette with retro pixel-art elements.

The map retains actual geographic coordinates and boundaries, while custom icons and animations provide a playful presentation of the subject matter.

## 📚 Data Sources and Credits

- **Sighting data:** [Bigfoot Sightings — Kaggle](https://www.kaggle.com/datasets/mexwell/bigfoot-sightings)
- **Report origins:** [Bigfoot Field Researchers Organization (BFRO)](https://www.bfro.net/)
- **Mapping library:** [MapLibre GL JS](https://maplibre.org/)
- **Pixel-art character:** Footzy sprites by Bird Brain Labs. Credit to the original artist; see the asset's license for applicable usage and redistribution conditions.
- **Text-to-speech:** Browser Web Speech API. Available voices depend on the visitor's browser and operating system.

## ⚠️ Disclaimer

This project is intended for cartographic exploration, data visualization, and educational purposes.

Sighting reports are presented as historical and anecdotal records. Their inclusion does not establish the existence of Bigfoot or verify individual claims.

This is an independent project and is not affiliated with BFRO, Kaggle, or MapLibre.

