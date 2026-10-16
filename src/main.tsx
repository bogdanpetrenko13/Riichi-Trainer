import { createRoot } from "react-dom/client";
import "./index.css";
import { i18n } from "./i18n";
import { initAppearance } from "./theme";
import MainMenu from "./states/MainMenu";

initAppearance();
document.documentElement.lang = i18n.language;

createRoot(document.getElementById("root")!).render(<MainMenu />);
