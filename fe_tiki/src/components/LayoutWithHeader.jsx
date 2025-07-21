import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

function LayoutWithHeader() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default LayoutWithHeader;
