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
import { LoginPage } from "../../pages/login-page";
import { ParticipantsPage } from "../../pages/participants-page";
import { ParticipantProfilePage } from "../../pages/participant-profile-page";
import { TeamProfilePage } from "../../pages/team-profile-page";
import { TeamsListPage } from "../../pages/teams-list-page";
import { CreateTeamPage } from "../../pages/create-team-page";
import { ProfileEditPage } from "../../pages/profile-edit-page";
import { ProtectedRoute } from "../../shared/components/protected-route";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "comands",
        element: (
          <ProtectedRoute>
            <MyComandPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "calendar",
        element: (
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hackathons/:id",
        element: (
          <ProtectedRoute>
            <HackathonInfoPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hackathons/:id/participants",
        element: (
          <ProtectedRoute>
            <ParticipantsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hackathons/:id/participants/:participantId",
        element: (
          <ProtectedRoute>
            <ParticipantProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hackathons/:id/teams",
        element: (
          <ProtectedRoute>
            <TeamsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hackathons/:id/teams/create",
        element: (
          <ProtectedRoute>
            <CreateTeamPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "hackathons/:id/teams/:teamId",
        element: (
          <ProtectedRoute>
            <TeamProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfileLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProfilePage />,
      },
      {
        path: "edit",
        element: <ProfileEditPage />,
      },
    ],
  },
  {
    path: "/form",
    element: (
      <ProtectedRoute>
        <FormLayout />
      </ProtectedRoute>
    ),
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
    element: (
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    ),
  },
]);
