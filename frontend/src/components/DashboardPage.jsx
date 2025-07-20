import { useEffect } from "react";
import { useAdminStore } from "../store/useAdminStore";

const DashboardPage = () => {
  const { stats, getStats } = useAdminStore();

  useEffect(() => {
    getStats();
  }, [getStats]);

  return (
    <div className="w-3/4 p-6 bg-base-100">
      <div className="text-2xl font-semibold mb-4">Dashboard Overview</div>

      {/* Thống kê */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="stat w-full">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{stats.userCount}</div>
        </div>
        <div className="stat w-full">
          <div className="stat-title">Total Reviews</div>
          <div className="stat-value">{stats.reviewCount}</div>
        </div>
        <div className="stat w-full">
          <div className="stat-title">Banned Users</div>
          <div className="stat-value text-red-500">{stats.bannedUsers}</div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-2">Recent Users</h2>
        <ul className="space-y-2">
          {stats.recentUsers.map((user) => (
            <li key={user._id} className="border p-2 rounded-md">
              <strong>{user.username}</strong> - {user.email}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Reviews */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-2">Recent Reviews</h2>
        <ul className="space-y-2">
          {stats.recentReviews.map((review) => (
            <li key={review._id} className="border p-2 rounded-md">
              <strong>{review.user.username}</strong>: {review.caption}
            </li>
          ))}
        </ul>
      </div>

      {/* Top Reviewers */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-2">Top Reviewers</h2>
        <ul className="space-y-2">
          {stats.topReviewers.map((user) => (
            <li key={user._id} className="border p-2 rounded-md">
              <strong>{user.username}</strong> - {user.reviewCount} reviews
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
