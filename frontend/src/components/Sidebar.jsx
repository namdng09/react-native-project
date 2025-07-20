import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-1/4 bg-base-300 p-4 flex flex-col">
      <div className="mb-6 text-xl font-semibold w-70">Admin Dashboard</div>
      <div className="flex flex-col gap-4">
        <Link to="/" className="btn btn-primary w-40">
          Dashboard
        </Link>
        <Link to="/admin/manage-users" className="btn btn-secondary w-40">
          Manage Users
        </Link>
        <Link to="/admin/manage-reviews" className="btn btn-accent w-40">
          Manage Reviews
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
