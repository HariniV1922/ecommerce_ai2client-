import React from "react";
import { Navigate } from "react-router-dom";
import { storage } from "../services/api";

export default function PrivateRoute({ children }) {
  const token = storage.getToken();
  return token ? children : <Navigate to="/login" replace />;
}
