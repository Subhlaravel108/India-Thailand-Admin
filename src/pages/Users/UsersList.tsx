import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers, ChangeUserStatus } from "@/lib/api";
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
import { Eye, Loader2, Search, UserPlus } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

const UsersList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch users with pagination
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({ page, search: searchQuery });
      setUsers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // ✅ Change user status with confirmation
  const handleChangeStatus = async (user: any) => {
    const newStatus = user.status === "Active" ? "Deactive" : "Active";
    const result = await Swal.fire({
      title: "Change User Status",
      text: `Are you sure you want to set ${user.name}'s status to ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await ChangeUserStatus({ user_id: user._id, status: newStatus });
        Swal.fire({
          icon: "success",
          title: "Status Changed",
          text: `User status changed to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, status: newStatus } : u
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Button onClick={() => navigate("/users/create-cc-user")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create CC User
        </Button>
      </div>

      <Card className="p-4 shadow-md">
        {/* 🔍 Search Bar */}
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search by name, email, or phone..."
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
                  <TableHead className="px-4 py-2">Phone</TableHead>
                  <TableHead className="px-4 py-2">Status</TableHead>
                  <TableHead className="px-4 py-2 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <TableRow key={user._id}>
                      <TableCell>{index + 1 + (page - 1) * 10}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
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
                              onClick={() => handleChangeStatus(user)}
                            >
                              {user.status === "Active"
                                ? "Set Deactive"
                                : "Set Active"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
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

      {/* 👁️ User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Name:</span>{" "}
                {selectedUser.name || "-"}
              </div>
              <div>
                <span className="font-semibold">Email:</span>{" "}
                {selectedUser.email || "-"}
              </div>
              <div>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedUser.phone || "-"}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                {selectedUser.status || "-"}
              </div>
              <div>
                <span className="font-semibold">Created At:</span>{" "}
                {selectedUser.createdAt
                  ? format(new Date(selectedUser.createdAt), "MMM d, yyyy")
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
