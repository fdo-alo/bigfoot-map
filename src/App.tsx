import './App.css'
import MapWithGeoJson from "./components/MapWithGeoJson.tsx";
import {assetUrl} from "./utils/assetUrl.ts";


function App() {

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="app-brand">
                    <span className="brand-icon">🌲</span>

                    <div className="brand-text">
                        <h1>Bigfoot Sightings</h1>
                        <p>An interactive atlas of reported encounters</p>
                    </div>
                </div>
            </header>

            <main className="app-map">
                <MapWithGeoJson
                    geoJsonUrlOrData={assetUrl("/data/bigfoot_points.geojson")}
                />
            </main>
        </div>
    );
}

export default App
