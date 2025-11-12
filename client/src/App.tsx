import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import EditorPage from "./pages/EditorPage";
import PreviewPage from "./pages/PreviewPage";
import CareersPage from "./pages/CareersPage";


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/:slug/edit" element={<EditorPage />} />
      <Route path="/:slug/preview" element={<PreviewPage />} />
      <Route path="/:slug/careers" element={<CareersPage />} />
    </Routes>
  );
};

export default App;
