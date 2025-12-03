import { createBrowserRouter } from "react-router";
import { RootLayout } from "../layouts/root-layout";
import { NotFoundPage } from "../../pages/not-found-page";
import { HomePage } from "../../pages/home-page";
import { CalendarPage } from "../../pages/calendar-page";
import { ProfilePage } from "../../pages/profile-page";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
