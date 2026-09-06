import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerAppServiceWorker } from "./lib/registerSW";
import { applyAppearance } from "./lib/appearance";

applyAppearance();

createRoot(document.getElementById("root")!).render(<App />);

registerAppServiceWorker();
