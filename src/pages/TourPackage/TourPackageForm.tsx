import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import api, {
  updateTourPackage,
  updateCategory,
  createTourPackage,
  fetchTourPackage
} from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import ReactQuill from "react-quill";

const TourPackageFrom = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState("");
  const [shortDescription, setshortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // ✅ Error clear karne wali function
  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // File upload function
  const fileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    clearError("imageUrl"); // ✅ Image upload start hote hi error clear
    
    const formDataData = new FormData();
    formDataData.append("imageUrl", file);

    try {
      const res = await api.post(
        "/upload-image",
        formDataData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success("Image uploaded successfully!");
        setImageUrl(res.data.imageUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Fetch category for edit
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      fetchTourPackage(id)
        .then((res) => {
          setTitle(res.data?.title || "");
          setshortDescription(res.data?.shortDescription || "");
          setImageUrl(res.data?.imageUrl || "");
          setStatus(res.data?.status || "Draft");
        })
        .catch(() => {
          toast.error("Failed to load Package");
          navigate("/tours/packages");
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, id, navigate]);

  // ✅ Title change handler with error clear
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    clearError("title");
  };

  // ✅ Description change handler with error clear
  const handleDescriptionChange = (value:string) => {
    setshortDescription(value);
    clearError("shortDescription");
  };

  // ✅ Status change handler with error clear
  const handleStatusChange = (value:string) => {
    setStatus(value);
    clearError("status"); // Agar status ka error field hai to
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Package name is required";
    }
  const plainDescription = shortDescription.replace(/<[^>]*>/g, "").trim();

if (!plainDescription) {
  newErrors.shortDescription = "Description is required";
}
    if (!imageUrl.trim()) {
      newErrors.imageUrl = "Image is required";
    }

    if(!status.trim()) {
            newErrors.status="Stauts is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        title, 
        shortDescription, 
        imageUrl, 
        status 
      };
      
      if (isEdit && id) {
        await updateTourPackage(id, payload);
        toast.success("Package updated successfully");
      } else {
        await createTourPackage(payload);
        toast.success("Package created successfully");
      }
      navigate("/tours/packages");
    } catch (error: any) {
        console.log("error=",error)
      toast.error(
        error?.response?.data?.message ||
          (isEdit ? "Failed to update package" : "Failed to create package")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/tours/packages")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Packages
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Package" : "Create New Package"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update an existing package."
              : "Add a new package to organize your content."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CategoryFormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Package Name *
                  </label>
                  <Input
                    id="name"
                    name="title"
                    value={title}
                    onChange={handleTitleChange} // ✅ Updated handler
                    placeholder="Enter package name"
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>
                
                {/* <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </label>
                  <Input
                    id="description"
                    name="shortDescription"
                    value={shortDescription}
                    onChange={handleDescriptionChange} // ✅ Updated handler
                    placeholder="Enter description"
                  />
                  {errors.shortDescription && <p className="text-red-500 text-sm">{errors.shortDescription}</p>}
                </div> */}
                 <div className="space-y-2 md:col-span-2">
                                  <label htmlFor="description" className="text-sm font-medium">
                                   Description
                                  </label>
                                  <ReactQuill
                                    id="description"
                                    value={shortDescription}
                                    onChange={handleDescriptionChange}
                
                                    placeholder="Write your blog content here"
                                    theme="snow"
                                    className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
                                  />
                                  {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription}</p>}
                                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={status}
                    onValueChange={handleStatusChange} // ✅ Updated handler
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="image" className="text-sm font-medium">
                    Image *
                  </label>
                  <Input 
                    type="file"
                    name="imageUrl"
                    onChange={fileUpload}
                    accept="image/*"
                  />

                  {uploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                      Uploading...
                    </div>
                  )}

                  {imageUrl && !uploading && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-24 h-24 rounded border mt-2"
                    />
                  )}
                  {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
                </div>
              </div>
              <CardFooter className="flex justify-between px-0">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/categories")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? isEdit
                      ? "Updating..."
                      : "Saving..."
                    : isEdit
                    ? "Update Package"
                    : "Create Package"}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Skeleton component (same as before)
const CategoryFormSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export default TourPackageFrom;