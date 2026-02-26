import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@clarium/ezui-react-components/styles.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
