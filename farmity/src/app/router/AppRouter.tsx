import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import HomePage from "../../pages/HomePage";
import FAQPage from "../../pages/FAQPage";
import DownloadPage from "../../pages/DownloadPage";
import SupportPage from "../../pages/SupportPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
