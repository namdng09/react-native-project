import { useState } from "react";
import { useAdminStore } from "../store/useAdminStore";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const { createUser } = useAdminStore();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser(formData);
    setFormData({ username: "", email: "", password: "", role: "user" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded shadow"
    >
      <h2 className="text-xl font-bold">Create New User</h2>

      <input
        type="text"
        name="username"
        className="input input-bordered w-full"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        className="input input-bordered w-full"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        className="input input-bordered w-full"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <select
        name="role"
        className="select select-bordered w-full"
        value={formData.role}
        onChange={handleChange}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="btn btn-primary w-full">
        Create User
      </button>
    </form>
  );
};

export default CreateUserForm;
