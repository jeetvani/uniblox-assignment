import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./index.css"
import { QueryProvider } from "./providers/query-provider"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Unable to find the root element")
}

createRoot(root).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
