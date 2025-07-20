import React, { useState } from "react";

const ManageReviewsPage = () => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="text-2xl font-semibold mb-4">Manage Reviews</div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="input input-bordered w-1/4"
          placeholder="Search reviews"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* Display review list here */}
    </div>
  );
};

export default ManageReviewsPage;
