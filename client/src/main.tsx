import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Logout from "./pages/Logout.tsx";
import Error from "./pages/Error.tsx";
import Layout from "./components/Layout.tsx";
import Account from "./pages/Account.tsx";
import CreateItineraries from "./pages/CreateItineraries.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import Itineraries from "./pages/Itineraries.tsx";
import DashboardItineraries from "./pages/DashboardItineraries.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <Error />,
        children: [
            {
                path: '/',
                element: <Login />,
            },
            {
                path: '/create-itinerary',
                element: <CreateItineraries />,
            },
            {
                path: '/itineraries',
                element: <Itineraries />,
            },
            {
              path: '/dashboard-itineraries',
                element: <DashboardItineraries />,
            },
            {
                path: 'logout',
                element: <Logout />,
            },
            {
                path: 'account',
                element: <Account />,
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <AuthProvider>
          <RouterProvider router={router}/>
      </AuthProvider>
  </React.StrictMode>,
)
