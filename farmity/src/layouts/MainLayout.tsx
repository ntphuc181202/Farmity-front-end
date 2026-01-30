import { Outlet } from "react-router-dom";
import Footer from "../components/navigation/Footer";

export default function MainLayout() {
  return (
    <>
      <main style={{ paddingTop: "110px", minHeight: "70vh" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
