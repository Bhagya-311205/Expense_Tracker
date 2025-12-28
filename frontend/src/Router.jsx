import { Navigate, createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OtpVerify from "./components/OtpVerify";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";

export function PublicRoute({ children, isLoggedIn }) {
  if (isLoggedIn) {
    return <Navigate to="/Dashboard" replace />;
  }
  return children;
}

export function PrivateRoute({ children, isLoggedIn }) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}


export function createAppRouter({ isLoggedIn, setIsLoggedIn }) {
  return createBrowserRouter([
    {
      path: "/",
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
          <Login setIsLoggedIn={setIsLoggedIn} />
        </PublicRoute>
      ),
    },
    {
      path: "/SignUp",
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
          <SignUp setIsLoggedIn={setIsLoggedIn} />
        </PublicRoute>
      ),
    },
    {
      element: <Layout setIsLoggedIn={setIsLoggedIn} />,
      children: [
        {
          path: "/Dashboard",
          element: (
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Dashboard setIsLoggedIn={setIsLoggedIn} />
            </PrivateRoute>
          ),
        },
        {
          path: "/Transactions",
          element: (
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Transactions setIsLoggedIn={setIsLoggedIn} />
            </PrivateRoute>
          ),
        },
        {
          path: "/AddTransaction",
          element: (
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <AddTransaction setIsLoggedIn={setIsLoggedIn} />
            </PrivateRoute>
          ),
        },
      ],
    },
    {
      path: "*",
      element: (
        <Navigate
          to={isLoggedIn ? "/Dashboard" : "/"}
          replace
        />
      ),
    },
  ]);
}