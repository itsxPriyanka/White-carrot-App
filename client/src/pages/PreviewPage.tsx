import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import CareersPage from "./CareersPage";

const PreviewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* ✅ Top Preview Banner */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3 text-center sticky top-0 z-20">
        <span className="font-medium text-yellow-800">
          You’re viewing a live preview of your Careers page
        </span>
        <button
          onClick={() => navigate(`/${slug}/edit`)}
          className="ml-4 text-sm font-semibold text-blue-700 hover:underline"
        >
          Back to Editor
        </button>
      </div>

      {/* ✅ Actual Careers Page Reuse */}
      {slug ? <CareersPage /> : <p className="text-center mt-10">Invalid preview URL</p>}
    </div>
  );
};

export default PreviewPage;
