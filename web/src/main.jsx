import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, Guard } from "./auth/Auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Finance from "./pages/Finance";
import Catalog from "./pages/Catalog";
import Feedback from "./pages/Feedback";
import Protocols from "./pages/Protocols";
import Profile from "./pages/Profile";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/web">
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        {["admin", "manager"].map((role) => (
          <Route key={role} element={<Guard role={role} />}>
            <Route path={role} element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              {role === "admin" ? (
                <>
                  <Route path="users" element={<Users />} />
                  <Route path="finance" element={<Finance />} />
                </>
              ) : (
                <>
                  <Route
                    path="plants"
                    element={<Catalog key="plants" kind="plants" />}
                  />
                  <Route
                    path="diseases"
                    element={<Catalog key="diseases" kind="diseases" />}
                  />
                  <Route path="feedback" element={<Feedback />} />
                  <Route path="protocols" element={<Protocols />} />
                </>
              )}
            </Route>
          </Route>
        ))}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
