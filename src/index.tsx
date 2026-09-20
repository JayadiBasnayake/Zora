import "./index.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from './components/ErrorBoundary';

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<ErrorBoundary><App /></ErrorBoundary>);
}