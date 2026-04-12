import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from "./pages/login";
import Signin from "./pages/signin";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
const router = createBrowserRouter([
  {
    path: "/",
    element: <div>welcome to the app </div>,
  },
  {
    path:"/signup",
    element:<Signin/>
  },
    {
    path:"/login",
    element:<Login/>
  }
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />//It is a component from React Router
  </StrictMode>,
)
