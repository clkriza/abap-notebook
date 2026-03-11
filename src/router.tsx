import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { HomePage } from "./pages/HomePage";
import { EntryDetailPage } from "./pages/EntryDetailPage";
import { NewEntryPage } from "./pages/NewEntryPage";
import { EditEntryPage } from "./pages/EditEntryPage";
import { SearchPage } from "./pages/SearchPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "entry/new", element: <NewEntryPage /> },
      { path: "entry/:id", element: <EntryDetailPage /> },
      { path: "entry/:id/edit", element: <EditEntryPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
