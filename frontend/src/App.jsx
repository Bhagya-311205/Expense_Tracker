import React from "react";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "./Router";
import { authAPI } from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        setIsLoggedIn(!!response.user);
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const router = React.useMemo(
    () => createAppRouter({ isLoggedIn, setIsLoggedIn }),
    [isLoggedIn]
  );

  if (loading) return null;

  return <RouterProvider router={router} />;
}

export default App;
