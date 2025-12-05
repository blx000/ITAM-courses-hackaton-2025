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
import { HackathonInfoPage } from "../../pages/hackathon-info-page";
import { SearchPage } from "../../pages/search-page";
import { MyComandPage } from "../../pages/my-comands-page";

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
        path: "comands",
        element: <MyComandPage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "notifications",
        element: <NotificationPage />,
      },
      {
        path: "hackathons/:id",
        element: <HackathonInfoPage />,
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
  {
    path: "/search",
    element: <SearchPage />,
  },
]);
