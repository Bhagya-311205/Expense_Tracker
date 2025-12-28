import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { toast } from "sonner";
import { authAPI } from "../services/api";

const PAGES = [
  { name: "Dashboard", path: "/Dashboard" },
  { name: "Transactions", path: "/Transactions" },
  { name: "Add Transaction", path: "/AddTransaction" },
];

function NavBar({ setIsLoggedIn }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (!userMenuOpen) setMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
    if (!mobileOpen) setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await authAPI.logout();
      if (response.message?.includes("Error")) {
        toast.error(response.message || "Logout failed");
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    toast.success("Logged out successfully");
    setIsLoggedIn(false);
    setLoading(false);
    navigate("/");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          to="/Dashboard" 
          className="flex items-center gap-2.5 text-xl font-bold text-white"
        >
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <AccountBalanceWalletIcon fontSize="large" />
          </div>
          <span className="tracking-wide">TrackEx</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {PAGES.map((page) => (
            <Link
              key={page.name}
              to={page.path}
              onClick={() => setUserMenuOpen(false)}
              className="relative px-4 py-2 text-sm font-semibold text-white/90 hover:text-white transition-all duration-200 group"
            >
              <span className="relative z-10">{page.name}</span>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/15 rounded-lg transition-all duration-200"></span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-white rounded-full transition-all duration-300"></span>
            </Link>
          ))}
          <div className="relative ml-2">
            <button
              onClick={toggleUserMenu}
              className={`rounded-full p-2 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 ${
                userMenuOpen ? "bg-white/25 scale-110" : ""
              }`}
              aria-label="User menu"
            >
              <AccountCircleIcon fontSize="large" />
            </button>
            {/* User Dropdown Menu */}
            <div
              className={`absolute right-0 mt-3 w-48 rounded-xl bg-blue-300 py-2 shadow-2xl border hover:bg-white border-white/20 backdrop-blur-md transition-all duration-200 ease-out origin-top-right ${
                userMenuOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Buttons */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleUserMenu}
            className={`rounded-full p-2 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 ${
              userMenuOpen ? "bg-white/25 scale-110" : ""
            }`}
            aria-label="User menu"
          >
            <AccountCircleIcon />
          </button>
          <button
            onClick={toggleMobileMenu}
            className="rounded-full p-2 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile User Menu */}
      <div className="md:hidden absolute right-4 top-14">
        <div
          className={`w-48 rounded-xl bg-blue-300 hover:bg-white mt-3.5 py-2 shadow-2xl border border-white/20 backdrop-blur-md transition-all duration-300 ease-out origin-top-right ${
            userMenuOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm font-semibold hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden border-t border-white/20 bg-linear-to-r from-blue-500 via-blue-400 to-blue-300 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen
            ? "opacity-100 max-h-96 py-4"
            : "opacity-0 max-h-0 py-0 pointer-events-none"
        }`}
      >
        <div className="space-y-1 px-4">
          {PAGES.map((page) => (
            <Link
              key={page.name}
              to={page.path}
              onClick={() => {
                setMobileOpen(false);
                setUserMenuOpen(false);
              }}
              className="block rounded-lg px-4 py-3 text-base font-semibold text-white hover:bg-white/20 transition-all duration-150 hover:translate-x-1"
            >
              {page.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
