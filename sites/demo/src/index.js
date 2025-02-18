import React from "react";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./App.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App
        dataset_url="***REMOVED***"
        imageUrl="***REMOVED***"
      />
    </BrowserRouter>
  </React.StrictMode>
);
