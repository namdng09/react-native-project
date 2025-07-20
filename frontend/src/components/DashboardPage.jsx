const DashboardPage = () => {
  return (
    <div className="w-3/4 p-6 bg-base-100">
      <div className="text-2xl font-semibold mb-4">Dashboard Overview</div>

      {/* Thống kê */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="stat w-full">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">1,280</div>
        </div>
        <div className="stat w-full">
          <div className="stat-title">Total Reviews</div>
          <div className="stat-value">345</div>
        </div>
        <div className="stat w-full">
          <div className="stat-title">Pending Reviews</div>
          <div className="stat-value">15</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
