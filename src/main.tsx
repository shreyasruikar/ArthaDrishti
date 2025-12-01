import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="arthadrishti-theme">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
