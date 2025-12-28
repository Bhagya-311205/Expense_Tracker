import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

function Layout({ setIsLoggedIn }) {
  return (
    <>
      <NavBar setIsLoggedIn={setIsLoggedIn} />
      <Outlet />
    </>
  );
}

export default Layout;