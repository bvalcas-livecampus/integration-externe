import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Logout from "./pages/Logout.tsx";
import Error from "./pages/Error.tsx";
import Layout from "./components/Layout.tsx";
import Account from "./pages/Account.tsx";
import Itineraries from "./pages/Itineraries.tsx";

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
                path: '/itineraries',
                element: <Itineraries />,
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
      <RouterProvider router={router}/>
  </React.StrictMode>,
)
