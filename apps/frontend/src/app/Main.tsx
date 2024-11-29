import "@/app/index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@/app/provider/Provider.tsx";
import { Modal } from "@/shared/ui/modal/Modal.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No root element found");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider />
    <Modal />
  </React.StrictMode>,
);
