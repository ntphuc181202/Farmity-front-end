import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage/index";
import FAQPage from "../../pages/FAQPage/index";
import DownloadPage from "../../pages/DownloadPage/index";
import SupportPage from "../../pages/SupportPage/index";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/support" element={<SupportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
