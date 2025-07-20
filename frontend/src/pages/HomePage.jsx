import DashboardPage from "../components/DashboardPage";
import Sidebar from "../components/Sidebar";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./../store/useAuthStore";
import ManageUsersPage from "../components/ManageUsersPage";
import ManageReviewsPage from "../components/ManageReviewsPage";

const HomePage = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <Routes>
              <Route
                path="/admin"
                element={
                  authUser ? <DashboardPage /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/admin/manage-users"
                element={authUser ? <ManageUsersPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/admin/manage-reviews"
                element={authUser ? <ManageReviewsPage /> : <Navigate to="/login" />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
