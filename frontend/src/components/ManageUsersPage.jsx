import React, { useState } from "react";

const ManageUsersPage = () => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="text-2xl font-semibold mb-4">Manage Users</div>
      {/* Search and Create User */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          className="input input-bordered w-1/4"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success">Create New User</button>
      </div>
      {/* Display user list here */}
    </div>
  );
};

export default ManageUsersPage;
