import React, { useEffect, useState } from "react";
import { fetchAllInquiries, changeInquiryStatus, sendInquiryMessage, assignInquiry, fetchInquiryMessages } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Search, MessageSquare, MoreVertical, UserPlus, History } from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const AllInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceType, setServiceType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningInquiry, setAssigningInquiry] = useState<any>(null);
  const [assignSource, setAssignSource] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [showMessageHistoryModal, setShowMessageHistoryModal] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedInquiryForHistory, setSelectedInquiryForHistory] = useState<any>(null);

  // ✅ Get user role on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
  }, []);

  // ✅ Load inquiries
  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetchAllInquiries({ page, search: searchQuery, serviceType: serviceType === "all" ? "" : serviceType });
      // console.log("📬 Inquiry Data:", res);

      // If cc_user, API should already filter by their assigned inquiries
      setInquiries(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error("❌ Error loading inquiries:", err);
      toast.error(err?.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadInquiries();
  }, [page, searchQuery, serviceType]);

  // ✅ Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // ✅ Handle service type filter change
  const handleServiceTypeChange = (value: string) => {
    setServiceType(value);
    setPage(1);
  };

  // ✅ Change inquiry status (for cc_user only)
  const handleChangeStatus = async (inquiry: any, newStatus: string) => {
    const result = await Swal.fire({
      title: "Change Inquiry Status",
      text: `Are you sure you want to change status to ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setChangingStatus(inquiry._id || inquiry.id);
        await changeInquiryStatus({
          inquiry_id: inquiry._id || inquiry.id,
          status: newStatus,
          source: inquiry.source || "",
        });
        Swal.fire({
          icon: "success",
          title: "Status Changed",
          text: `Inquiry status changed to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
        setInquiries((prev) =>
          prev.map((i) =>
            (i._id || i.id) === (inquiry._id || inquiry.id)
              ? { ...i, status: newStatus }
              : i
          )
        );
        if (selectedInquiry && (selectedInquiry._id || selectedInquiry.id) === (inquiry._id || inquiry.id)) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Failed to change status",
        });
      } finally {
        setChangingStatus(null);
        loadInquiries()
        
      }
    }
  };

  // ✅ Open message modal
  const handleOpenMessageModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setShowMessageModal(true);
    setMessageText("");
    // If view modal is open, we'll keep selectedInquiry so message modal can use it
  };

  // ✅ Send message to inquiry
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!selectedInquiry) {
      toast.error("No inquiry selected");
      return;
    }

    try {
      setSendingMessage(true);
      await sendInquiryMessage({
        inquiry_id: selectedInquiry._id || selectedInquiry.id,
        message: messageText,
        source: selectedInquiry.source
      });
      Swal.fire({
        icon: "success",
        title: "Message Sent",
        text: "Message has been sent successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowMessageModal(false);
      setSelectedInquiry(null); // Close both modals
      setMessageText("");
      // Optionally reload inquiries or update state
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to send message",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // ✅ Open assign modal
  const handleOpenAssignModal = (inquiry: any) => {
    setAssigningInquiry(inquiry);
    setAssignSource(inquiry.source || "");
    setShowAssignModal(true);
  };

  // ✅ Assign inquiry to cc_user
  const handleAssignInquiry = async () => {
    if (!assignSource.trim()) {
      toast.error("Please select a source");
      return;
    }

    if (!assigningInquiry) {
      toast.error("No inquiry selected");
      return;
    }

    // Close Dialog first to avoid z-index conflict
    setShowAssignModal(false);
    
    // Small delay to ensure Dialog is closed before showing Swal
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await Swal.fire({
      title: "Assign Inquiry",
      text: `Are you sure you want to assign this inquiry with source "${assignSource}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Assign",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      buttonsStyling: true,
      allowOutsideClick: false,
      customClass: {
        container: 'swal2-container-high-z'
      }
    });

    if (result.isConfirmed) {
      try {
        setAssigning(true);
        await assignInquiry({
          inquiry_id: assigningInquiry._id || assigningInquiry.id,
          source: assignSource,
        });
        Swal.fire({
          icon: "success",
          title: "Inquiry Assigned",
          text: "Inquiry has been assigned successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setShowAssignModal(false);
        setAssigningInquiry(null);
        setAssignSource("");
        // Reload inquiries to reflect the assignment
        const res = await fetchAllInquiries({ page, search: searchQuery, serviceType: serviceType === "all" ? "" : serviceType });
        setInquiries(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Failed to assign inquiry",
        });
      } finally {
        setAssigning(false);
      }
    }
  };

  // ✅ Fetch and display message history
  const handleViewMessageHistory = async (inquiry: any) => {
    setSelectedInquiryForHistory(inquiry);
    setShowMessageHistoryModal(true);
    setLoadingMessages(true);
    setMessageHistory([]);

    try {
      const res = await fetchInquiryMessages({
        inquiry_id: inquiry._id || inquiry.id,
        source: inquiry.source || "service",
      });
      setMessageHistory(res.data || res.messages || []);
    } catch (error: any) {
      console.error("Error fetching message history:", error);
      toast.error(error?.response?.data?.message || "Failed to load message history");
      setMessageHistory([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">All Inquiries</h1>
      </div>

      <Card className="p-4 shadow-md">
        {/* 🔍 Search Input and Filters */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center flex-1 min-w-[200px]">
            <Search className="w-5 h-5 text-gray-500 mr-2" />
            <Input
              placeholder="Search by name, email, phone, subject ..."
              value={searchQuery}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Service Type:</label>
            <Select value={serviceType} onValueChange={handleServiceTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 📋 Table */}
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-2">#</TableHead>
                <TableHead className="px-4 py-2">Name</TableHead>
                <TableHead className="px-4 py-2">Email</TableHead>
                <TableHead className="px-4 py-2">Phone</TableHead>
                <TableHead className="px-4 py-2">Service</TableHead>
                <TableHead className="px-4 py-2">Subject</TableHead>
                <TableHead className="px-4 py-2">Status</TableHead>
                <TableHead className="px-4 py-2">Created</TableHead>
                <TableHead className="px-4 py-2 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    <Loader2 className="animate-spin inline w-6 h-6 text-gray-500 mr-2" />
                    Loading inquiries...
                  </TableCell>
                </TableRow>
              ) : inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    No inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((i, index) => (
                  <TableRow key={i._id || i.id}>
                    <TableCell>{index + 1 + (page - 1) * 10}</TableCell>
                    <TableCell>
                      {i.name} {i.lastname || ""}
                    </TableCell>
                    <TableCell className="max-w-[170px] truncate">{i.email || "-"}</TableCell>
                    <TableCell>{i.phone || "-"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {i.source || "-"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {i.type || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          i.status === "new" || i.status === "New"
                            ? "bg-green-100 text-green-800"
                            : i.status === "In Progress" || i.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {i.status || "New"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {i.createdAt
                        ? format(new Date(i.createdAt), "dd MMM yyyy")
                        : i.created_at
                        ? format(new Date(i.created_at), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {userRole === "cc_user" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(i)}
                            className="h-8"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 px-2">
                                <MoreVertical className="w-4 h-4" />
                                <span className="sr-only">More actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                                Status
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(i, "New")}
                                disabled={changingStatus === (i._id || i.id) || (i.status?.toLowerCase() === "new" || i.status === "New")}
                                className="cursor-pointer"
                              >
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  (i.status?.toLowerCase() === "new" || i.status === "New") ? "bg-green-500" : "bg-gray-300"
                                }`}></span>
                                Set Status: New
                                {(i.status?.toLowerCase() === "new" || i.status === "New") && (
                                  <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(i, "In Progress")}
                                disabled={changingStatus === (i._id || i.id) || (i.status?.toLowerCase() === "in progress" || i.status === "In Progress")}
                                className="cursor-pointer"
                              >
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  (i.status?.toLowerCase() === "in progress" || i.status === "In Progress") ? "bg-yellow-500" : "bg-gray-300"
                                }`}></span>
                                Set Status: In Progress
                                {(i.status?.toLowerCase() === "in progress" || i.status === "In Progress") && (
                                  <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(i, "Closed")}
                                disabled={changingStatus === (i._id || i.id) || (i.status?.toLowerCase() === "closed" || i.status === "Closed")}
                                className="cursor-pointer"
                              >
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  (i.status?.toLowerCase() === "closed" || i.status === "Closed") ? "bg-gray-500" : "bg-gray-300"
                                }`}></span>
                                Set Status: Closed
                                {(i.status?.toLowerCase() === "closed" || i.status === "Closed") && (
                                  <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                                Communication
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleOpenMessageModal(i)}
                                className="cursor-pointer"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleViewMessageHistory(i)}
                                className="cursor-pointer"
                              >
                                <History className="mr-2 h-4 w-4" />
                                View Message History
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                                Assignment
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleOpenAssignModal(i)}
                                disabled={i.assignedCC}
                                className="cursor-pointer"
                              >
                                <UserPlus className={`mr-2 h-4 w-4 ${i.assignedCC ? "opacity-50" : ""}`} />
                                {i.assignedCC ? "Already Assigned" : "Assign Inquiry"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(i)}
                            className="h-8"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessageHistory(i)}
                            className="h-8"
                          >
                            <History className="w-4 h-4 mr-1" /> History
                          </Button>
                        </div>
                      )}
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
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Card>

      {/* 👁️ View Modal */}
      {selectedInquiry && !showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setSelectedInquiry(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Inquiry Details</h2>
            <div className="space-y-3">
              <div>
                <strong>Name:</strong> {selectedInquiry.name}{" "}
                {selectedInquiry.lastname || ""}
              </div>
              <div>
                <strong>Email:</strong> {selectedInquiry.email || "-"}
              </div>
              <div>
                <strong>Phone:</strong> {selectedInquiry.phone || "-"}
              </div>
              {selectedInquiry.type && (
                <div>
                  <strong>Subject:</strong> {selectedInquiry.type}
                </div>
              )}
              <div className="break-words whitespace-pre-line">
                <strong>Message:</strong>{" "}
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedInquiry.message || "-"}
                </div>
              </div>
              {selectedInquiry.status && (
                <div>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      selectedInquiry.status === "new" ||
                      selectedInquiry.status === "New"
                        ? "bg-green-100 text-green-800"
                        : selectedInquiry.status === "In Progress" ||
                          selectedInquiry.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>
              )}
              <div>
                <strong>Created At:</strong>{" "}
                {selectedInquiry.createdAt
                  ? format(new Date(selectedInquiry.createdAt), "dd MMM yyyy, hh:mm a")
                  : selectedInquiry.created_at
                  ? format(new Date(selectedInquiry.created_at), "dd MMM yyyy, hh:mm a")
                  : "-"}
              </div>
            </div>
            {userRole === "cc_user" && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Change Status:
                  </label>
                  <Select
                    value={selectedInquiry.status || "New"}
                    onValueChange={(value) =>
                      handleChangeStatus(selectedInquiry, value)
                    }
                    disabled={changingStatus === (selectedInquiry._id || selectedInquiry.id)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleOpenMessageModal(selectedInquiry)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedInquiry(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📨 Message Modal (for cc_user) */}
      {showMessageModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => {
                setShowMessageModal(false);
                setSelectedInquiry(null); // Close both modals
                setMessageText("");
              }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Send Message</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  To: {selectedInquiry.name} ({selectedInquiry.email})
                </label>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message:
                </label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedInquiry(null); // Close both modals
                  setMessageText("");
                }}
                disabled={sendingMessage}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 Assign Inquiry Modal (for cc_user) */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Inquiry</DialogTitle>
            <DialogDescription>
              Select the source type for this inquiry. This will assign the inquiry to you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="source" className="text-sm font-medium">
                Source Type *
              </label>
              <Select
                value={assignSource}
                onValueChange={setAssignSource}
              >
                <SelectTrigger id="source" className="w-full">
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              {assigningInquiry && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Inquiry:</strong> {assigningInquiry.name} ({assigningInquiry.email})</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModal(false);
                setAssigningInquiry(null);
                setAssignSource("");
              }}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignInquiry}
              disabled={assigning || !assignSource.trim()}
            >
              {assigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Inquiry
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 📜 Message History Modal */}
      <Dialog open={showMessageHistoryModal} onOpenChange={setShowMessageHistoryModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message History</DialogTitle>
            <DialogDescription>
              {selectedInquiryForHistory && (
                <>Messages for {selectedInquiryForHistory.name} ({selectedInquiryForHistory.email})</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
                <span className="text-gray-500">Loading messages...</span>
              </div>
            ) : messageHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages found for this inquiry.
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {messageHistory.map((msg: any, index: number) => (
                  <div
                    key={msg._id || msg.id || index}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {msg.sender && (
                            <span className="text-sm font-semibold text-gray-700">
                              {typeof msg.sender === "object" ? msg.sender.name || msg.sender.email : msg.sender}
                            </span>
                          )}
                          {msg.role && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {msg.role}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                          {msg.message || msg.text || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {msg.createdAt
                          ? format(new Date(msg.createdAt), "dd MMM yyyy, hh:mm a")
                          : msg.created_at
                          ? format(new Date(msg.created_at), "dd MMM yyyy, hh:mm a")
                          : msg.timestamp
                          ? format(new Date(msg.timestamp), "dd MMM yyyy, hh:mm a")
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageHistoryModal(false);
                setSelectedInquiryForHistory(null);
                setMessageHistory([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllInquiries;

