const HomePage = () => {
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/4 bg-base-300 p-4 flex flex-col">
              <div className="mb-6 text-xl font-semibold">Admin Dashboard</div>
              <div className="flex flex-col gap-4">
                <button className="btn btn-primary">Dashboard</button>
                <button className="btn btn-secondary">Manage Users</button>
                <button className="btn btn-accent">Manage Reviews</button>
              </div>
            </div>

            {/* Main Content */}
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

              {/* Button actions for CRUD */}
              <div className="flex gap-4 mb-6">
                <button className="btn btn-success">Create User</button>
                <button className="btn btn-info">Edit Review</button>
                <button className="btn btn-warning">Delete User</button>
              </div>

              {/* Content for selected menu (e.g., Manage Users or Manage Reviews) */}
              <div className="p-4 border rounded-md shadow-lg bg-white">
                <h2 className="text-xl font-medium mb-4">User List</h2>
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Doe</td>
                      <td>john@example.com</td>
                      <td>Admin</td>
                      <td>
                        <button className="btn btn-warning btn-sm">Edit</button>
                        <button className="btn btn-danger btn-sm ml-2">Delete</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Jane Smith</td>
                      <td>jane@example.com</td>
                      <td>User</td>
                      <td>
                        <button className="btn btn-warning btn-sm">Edit</button>
                        <button className="btn btn-danger btn-sm ml-2">Delete</button>
                      </td>
                    </tr>
                    {/* More users */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
