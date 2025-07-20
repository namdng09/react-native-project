import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { useNavigate } from "react-router-dom";

const ManageUsersPage = () => {
  const [search, setSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const { users, fetchUsers, deleteUser, loadingUsers, toggleBanStatus } =
    useAdminStore();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  console.log("user", users);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 border rounded-md shadow-lg w-full">
      <h2 className="text-xl font-medium mb-4">User List</h2>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          className="input input-bordered w-1/3"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/manage-users/create")}
        >
          Create New User
        </button>
      </div>

      {loadingUsers ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Avata</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Banned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={user.profileImage} alt={user.username} />
                    </div>
                  </div>
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "admin"
                        ? "badge-error"
                        : user.role === "moderator"
                          ? "badge-warning"
                          : "badge-info"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${
                      user.banned
                        ? "btn-outline btn-success"
                        : "btn-outline btn-error"
                    }`}
                    onClick={() => toggleBanStatus(user._id)}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm mr-2.5"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsModalOpen(true);
                    }}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() =>
                      navigate(`/admin/manage-users/edit/${user._id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-error btn-sm ml-2"
                    onClick={() => setDeletingUserId(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {isModalOpen && selectedUser && (
              <dialog id="user_detail_modal" className="modal modal-open">
                <div className="modal-box w-11/12 max-w-md">
                  <h3 className="font-bold text-lg mb-4">User Details</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="w-16 rounded-full">
                          <img
                            src={selectedUser.profileImage}
                            alt={selectedUser.username}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {selectedUser.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                    <p>
                      <strong>Role:</strong> {selectedUser.role}
                    </p>
                    <p>
                      <strong>Banned:</strong>{" "}
                      {selectedUser.banned ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="modal-action">
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setSelectedUser(null);
                        setIsModalOpen(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </dialog>
            )}
            {deletingUserId && (
              <dialog id="delete_modal" className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg text-red-500">
                    Confirm Deletion
                  </h3>
                  <p className="py-4">
                    Are you sure you want to delete this user?
                  </p>
                  <div className="modal-action">
                    <button
                      className="btn btn-outline"
                      onClick={() => setDeletingUserId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={async () => {
                        await deleteUser(deletingUserId);
                        setDeletingUserId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </dialog>
            )}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsersPage;
