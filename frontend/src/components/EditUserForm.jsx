import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const EditUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, fetchUsers, updateUserById } = useAdminStore();
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profileImage: base64Image });
    };
  };
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user",
    banned: false,
    password: "",
  });

  useEffect(() => {
    // Fetch users if not available
    if (!users.length) fetchUsers();
  }, [fetchUsers, users.length]);

  useEffect(() => {
    const userToEdit = users.find((u) => u._id === id);
    if (userToEdit) {
      setFormData({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        role: userToEdit.role || "user",
        banned: userToEdit.banned || false,
        password: "",
      });
    }
  }, [id, users]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUserById(id, formData);
    if (success) {
      navigate("/admin/manage-users");
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <h2 className="text-2xl font-bold text-center">Edit User</h2>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profileImage || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                name="username"
                className="input input-bordered w-full"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Role</label>
              <select
                name="role"
                className="select select-bordered w-full"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="label">Banned</label>
              <input
                type="checkbox"
                name="banned"
                className="checkbox"
                checked={formData.banned}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">New Password (optional)</label>
              <input
                type="password"
                name="password"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep old password"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/admin/manage-users")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
