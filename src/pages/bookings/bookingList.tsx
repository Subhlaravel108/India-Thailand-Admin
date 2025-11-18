import React, { useEffect, useState } from "react";
import { fetchAllBookings } from "@/lib/api"; // 👈 define this API helper below
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
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BookingList = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // ✅ Load bookings
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const res = await fetchAllBookings({ page, search: searchQuery });
        console.log("📦 Booking Data:", res);

        setBookings(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        console.error("❌ Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [page, searchQuery]);

  // ✅ Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // ✅ Client-side filtering (optional)
  const filteredBookings = bookings.filter(
    (b) =>
      b.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadExcel = async () => {
  try {
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";

    if (!token) {
      toast.error("Token missing! Please login again.");
      return;
    }

    const response = await fetch(
      `https://india-thailand-api-8.onrender.com/api/bookings/export`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
       toast.error("Failed to download file");
      return;
    }

    // Convert API response to downloadable Excel
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.xlsx"; // File Name
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!");
  }
};


  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
       <button
  onClick={downloadExcel}
  className="px-4 py-2 bg-green-600 text-white rounded"
>
  Download Excel
</button>

      </div>

      <Card className="p-4 shadow-md">
        {/* 🔍 Search bar */}
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>

        {/* 📋 Table */}
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Package Type</TableHead>
                <TableHead>Travelers</TableHead>
                <TableHead>Travel Date</TableHead>
                {/* <TableHead>Message</TableHead> */}
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6">
                    <Loader2 className="animate-spin inline w-6 h-6 text-gray-500 mr-2" />
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b, index) => (
                  <TableRow key={b._id}>
                    <TableCell>{index + 1 + (page - 1) * 10}</TableCell>
                    <TableCell>{b.fullName}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.phone}</TableCell>
                    <TableCell>{b.destination}</TableCell>
                    <TableCell>{b.packageType}</TableCell>
                    <TableCell>{b.travelers}</TableCell>
                    <TableCell>{b.travelDate}</TableCell>
                    {/* <TableCell className="max-w-[200px] truncate">
                      {b.message || "-"}
                    </TableCell> */}
                    <TableCell>
                      {b.createdAt
                        ? format(new Date(b.createdAt), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(b)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 📄 Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span>
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

      {/* 👁️ View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedBooking(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="space-y-2">
              <p>
                <strong>Full Name:</strong> {selectedBooking.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedBooking.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedBooking.phone}
              </p>
              <p>
                <strong>Destination:</strong> {selectedBooking.destination}
              </p>
              <p>
                <strong>Package Type:</strong> {selectedBooking.packageType}
              </p>
              <p>
                <strong>Travelers:</strong> {selectedBooking.travelers}
              </p>
              <p>
                <strong>Travel Date:</strong> {selectedBooking.travelDate}
              </p>
              <p className="break-words whitespace-pre-line">
                <strong>Message:</strong> {selectedBooking.message || "-"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {selectedBooking.createdAt
                  ? format(new Date(selectedBooking.createdAt), "dd MMM yyyy")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
