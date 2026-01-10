import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Edit, Plus, Search, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fetchDestinations, deleteDestination } from "@/lib/api";
import Swal from "sweetalert2";

const DestinationSkeleton = () => (
  <div className="p-4 space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="h-8 w-10 bg-gray-200 rounded" />
        <div className="h-8 w-[600px] bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded ml-auto" />
      </div>
    ))}
  </div>
);

const DestinationList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // ✅ Fetch Destinations
  const loadDestinations = async (search = "", pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchDestinations({ page: pageNum, search });
      if (res.success) {
        setDestinations(res.data || []);
        console.log("destination=",res)
        setTotalPages(res.pagination.totalPages || 1);
        setLimit(res.pagination.limit || 10);
        setTotal(res.pagination.total || 0);
      } else {
        setDestinations([]);
        toast.error(res.message || "Failed to fetch destinations");
      }
    } catch (e) {
      toast.error("Failed to load destinations");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedSearch(searchQuery);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ✅ Call API when debouncedSearch or page changes
  useEffect(() => {
    loadDestinations(debouncedSearch, page);
  }, [debouncedSearch, page]);

  // ✅ Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // ✅ Handle delete
  const handleDeleteDestination = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDestination(id);
        setDestinations(destinations.filter((des) => des._id !== id));
        toast.success("Destination deleted successfully");
      } catch {
        toast.error("Failed to delete destination");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
        <Button asChild>
          <Link to="/destination/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Destination
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        {/* Search Bar */}
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search destination..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border min-h-[200px]">
          {loading ? (
            <DestinationSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Feature Image</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {destinations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No destination found.
                    </TableCell>
                  </TableRow>
                ) : (
                  destinations.map((des, idx) => (
                    <TableRow key={des._id}>
                      <TableCell className="font-medium">
                        {(page - 1) * limit + (idx + 1)}
                      </TableCell>
                      <TableCell>{des.title}</TableCell>
                      <TableCell>
                        <img src={des.featured_image} alt=""
                        className="h-20 w-20"
                         />
                        
                        </TableCell>
                      <TableCell>{des.description.replace(/<[^>]*>/g, "").slice(0, 80)}...</TableCell>
                      <TableCell>  <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  des.status === "Active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {des.status}
                                              </span></TableCell>
                      <TableCell>
                        {des.createdAt
                          ? format(new Date(des.createdAt), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/destination/edit/${des.slug}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDestination(des._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {destinations.length === 0 ? 0 : (page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} entries
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DestinationList;
