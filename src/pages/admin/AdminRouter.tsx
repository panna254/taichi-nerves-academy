import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import AdminLogin from "./AdminLogin";
import DashboardOverview from "./DashboardOverview";
import ContentListPage from "./ContentListPage";
import ContentEditorPage from "./ContentEditorPage";
import ReviewQueuePage from "./ReviewQueuePage";
import MediaLibrary from "./MediaLibrary";
import UsersRolesPage from "./UsersRolesPage";
import Settings from "./Settings";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user } = useAdminAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
};

const AdminRouter = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <RequireAuth>
              <AdminShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="content" element={<ContentListPage />} />
          <Route path="content/new" element={<ContentEditorPage />} />
          <Route path="content/:id" element={<ContentEditorPage />} />
          <Route path="review" element={<ReviewQueuePage />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersRolesPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminRouter;


