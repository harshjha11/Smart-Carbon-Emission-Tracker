import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { GoalProvider } from "./components/GoalContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoalProvider>
      <App />
    </GoalProvider>
  </BrowserRouter>,
);
