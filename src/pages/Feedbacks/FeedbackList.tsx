import React, { useEffect, useState } from "react";
import { fetchFeedbacks,ChangeFeedbackStatus } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Search, Star } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

const FeedbackList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch feedbacks with pagination
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetchFeedbacks({ page, search: searchQuery });
      setFeedbacks(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("❌ Failed to fetch feedbacks:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load feedbacks",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [page, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // ✅ Change feedback status with confirmation
  const handleChangeStatus = async (feedback: any) => {
    const newStatus = feedback.status === "pending" ? "approved" : "pending";
    const result = await Swal.fire({
      title: "Change Feedback Status",
      text: `Are you sure you want to set this feedback's status to ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await ChangeFeedbackStatus({ feedback_id: feedback._id, status: newStatus });
        Swal.fire({
          icon: "success",
          title: "Status Changed",
          text: `Feedback status changed to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
        setFeedbacks((prev) =>
          prev.map((f) =>
            f._id === feedback._id ? { ...f, status: newStatus } : f
          )
        );
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Failed to change status",
        });
      }
    }
  };

  // ✅ Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  // ✅ Truncate long messages for table view
  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Customer Feedbacks</h1>
      </div>

      <Card className="p-4 shadow-md">
        {/* 🔍 Search Bar */}
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search by name, email, or feedback..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>

        {/* 🧭 Table with Loading State */}
        <div className="overflow-x-auto rounded-md border min-h-[300px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-2">#</TableHead>
                  <TableHead className="px-4 py-2">Name</TableHead>
                  <TableHead className="px-4 py-2">Email</TableHead>
                  <TableHead className="px-4 py-2">Rating</TableHead>
                  <TableHead className="px-4 py-2">Message</TableHead>
                  <TableHead className="px-4 py-2">Status</TableHead>
                  <TableHead className="px-4 py-2 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No feedbacks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback, index) => (
                    <TableRow key={feedback._id}>
                      <TableCell>{index + 1 + (page - 1) * 10}</TableCell>
                      <TableCell className="font-medium">{feedback.name}</TableCell>
                      <TableCell>{feedback.email}</TableCell>
                      <TableCell>{renderStars(feedback.rating)}</TableCell>
                      <TableCell title={feedback.message}>
                        {truncateMessage(feedback.message)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            feedback.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {feedback.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white shadow-lg border"
                          >
                            <DropdownMenuItem
                              onClick={() => handleChangeStatus(feedback)}
                            >
                              {feedback.status === "pending"
                                ? "Set approved"
                                : "Set pending"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFeedback(feedback);
                                setShowModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* 🧭 Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Card>

      {/* 👁️ Feedback Detail Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Feedback Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900 mt-1">{selectedFeedback.name || "-"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900 mt-1">{selectedFeedback.email || "-"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900 mt-1">{selectedFeedback.phone || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Rating & Status</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Rating:</span>
                      <div className="mt-1">
                        {renderStars(selectedFeedback.rating)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-sm ${
                          selectedFeedback.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedFeedback.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Message & Additional Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Feedback Message</h3>
                  <div className="bg-white p-4 rounded border min-h-[120px]">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedFeedback.message || "-"}
                    </p>
                  </div>
                </div>

                {selectedFeedback.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Attached Image</h3>
                    <div className="flex justify-center">
                      <img
                        src={selectedFeedback.image}
                        alt="Feedback attachment"
                        className="max-w-full h-auto max-h-48 rounded-lg border shadow-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Timeline</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-600">Created At:</span>
                      <p className="text-gray-900 mt-1">
                        {selectedFeedback.createdAt
                          ? format(new Date(selectedFeedback.createdAt), "PPpp")
                          : "-"}
                      </p>
                    </div>
                    {selectedFeedback.updatedAt && (
                      <div>
                        <span className="font-medium text-gray-600">Last Updated:</span>
                        <p className="text-gray-900 mt-1">
                          {format(new Date(selectedFeedback.updatedAt), "PPpp")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;