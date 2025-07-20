import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-1/4 bg-base-300 p-4 flex flex-col">
      <div className="mb-6 text-xl font-semibold">Admin Dashboard</div>
      <div className="flex flex-col gap-4">
        <Link to="/admin" className="btn btn-primary">
          Dashboard
        </Link>
        <Link to="/admin/manage-users" className="btn btn-secondary">
          Manage Users
        </Link>
        <Link to="/admin/manage-reviews" className="btn btn-accent">
          Manage Reviews
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
