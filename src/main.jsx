import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { NextUIProvider } from '@nextui-org/react'
import router from "./Router/router.jsx";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")).render(
    <NextUIProvider>
    <React.StrictMode>
    <RouterProvider router={router} />
    </React.StrictMode>
    </NextUIProvider>
);
