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
import { fetchTours, deleteTour } from "@/lib/api";
import Swal from "sweetalert2";

const ToursSkeleton = () => (
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

const ToursList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // ✅ Fetch Tours
  const loadTours = async (search = "", pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchTours({ page: pageNum, search });
      if (res.success) {
        setTours(res.data || []);
        setTotalPages(res.totalPages || 1);
        setLimit(res.limit || 10);
        setTotal(res.total || 0);
      } else {
        setTours([]);
        toast.error(res.message || "Failed to fetch tours");
      }
    } catch (e) {
      toast.error("Failed to load tours");
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
    loadTours(debouncedSearch, page);
  }, [debouncedSearch, page]);

  // ✅ Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // ✅ Handle delete
  const handleDeleteTour = async (id: string) => {
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
        await deleteTour(id);
        setTours(tours.filter((tour) => tour._id !== id));
        toast.success("Tour deleted successfully");
      } catch {
        toast.error("Failed to delete tour");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tours</h1>
        <Button asChild>
          <Link to="/tours/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Tour
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        {/* Search Bar */}
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search tour..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border min-h-[200px]">
          {loading ? (
            <ToursSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Tour Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Hotel Type</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No tours found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tours.map((tour, idx) => (
                    <TableRow key={tour._id}>
                      <TableCell className="font-medium">
                        {(page - 1) * limit + (idx + 1)}
                      </TableCell>
                      <TableCell>{tour.title}</TableCell>
                      <TableCell>{tour.tour_duration}</TableCell>
                      <TableCell>{tour.price}</TableCell>
                      <TableCell>{tour.hotelType}</TableCell>
                      <TableCell>{tour.people}</TableCell>
                      <TableCell>
                        {tour.createdAt
                          ? format(new Date(tour.createdAt), "MMM d, yyyy")
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
                              <Link to={`/tours/edit/${tour.slug}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTour(tour._id)}
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
              {tours.length === 0 ? 0 : (page - 1) * limit + 1} to{" "}
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

export default ToursList;
