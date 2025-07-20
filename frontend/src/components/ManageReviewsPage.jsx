import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";

const ManageReviewsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { reviews, fetchAllReviews, deleteReview, loadingReviews } = useAdminStore();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const filteredReviews = reviews.filter(
    (review) =>
      review.user.username.toLowerCase().includes(search.toLowerCase()) ||
      review.caption.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 border rounded-md shadow-lg w-full">
      <h2 className="text-xl font-medium mb-4">Review List</h2>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          className="input input-bordered w-1/3"
          placeholder="Search reviews"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loadingReviews ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Avatar</th>
              <th>Content</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review._id}>
                <td>{review.user.username}</td>
                <td>
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={review.user.profileImage} alt={review.user.username} />
                    </div>
                  </div>
                </td>
                <td className="max-w-xs truncate">{review.caption}</td>
                <td>{new Date(review.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm mr-2"
                    onClick={() => {
                      setSelectedReview(review);
                      setIsModalOpen(true);
                    }}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => setDeletingReviewId(review._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {isModalOpen && selectedReview && (
        <dialog id="review_detail_modal" className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-lg mb-4">Review Details</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="avatar">
                <div className="w-16 rounded-full">
                  <img src={selectedReview.user.profileImage} alt={selectedReview.user.username} />
                </div>
              </div>
              <div>
                <p className="font-semibold">{selectedReview.user.username}</p>
              </div>
            </div>
            <p><strong>Content:</strong></p>
            <p className="bg-base-200 p-3 rounded-lg">{selectedReview.caption}</p>
            <p className="text-sm mt-2">
              <strong>Created At:</strong>{" "}
              {new Date(selectedReview.createdAt).toLocaleString()}
            </p>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelectedReview(null);
                  setIsModalOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {deletingReviewId && (
        <dialog id="delete_modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-red-500">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this review?</p>
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setDeletingReviewId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  await deleteReview(deletingReviewId);
                  setDeletingReviewId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ManageReviewsPage;
