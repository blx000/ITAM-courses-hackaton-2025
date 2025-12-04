import { createBrowserRouter } from "react-router";
import { RootLayout } from "../layouts/root-layout";
import { ProfileLayout } from "../layouts/profile-layout";
import { FormLayout } from "../layouts/form-layout";
import { HelpLayout } from "../layouts/help-layout";
import { NotFoundPage } from "../../pages/not-found-page";
import { HomePage } from "../../pages/home-page";
import { CalendarPage } from "../../pages/calendar-page";
import { ProfilePage } from "../../pages/profile-page";
import { FormPage } from "../../pages/form-page";
import { HelpPage } from "../../pages/help-page";
import { NotificationPage } from "../../pages/notification-page";
import { CommandPage } from "../../pages/commands-page";

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
        path: "/commands",
        element: <CommandPage />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
      {
        path: "/notifications",
        element: <NotificationPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: <ProfileLayout />,
    children: [
      {
        index: true,
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/form",
    element: <FormLayout />,
    children: [
      {
        index: true,
        element: <FormPage />,
      },
    ],
  },
  {
    path: "/help",
    element: <HelpLayout />,
    children: [
      {
        index: true,
        element: <HelpPage />,
      },
    ],
  },
]);
