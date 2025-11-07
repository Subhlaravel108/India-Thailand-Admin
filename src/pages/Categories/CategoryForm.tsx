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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api, {
  categoryCreate,
  fetchCategory,
  updateCategory,
  categoryFetchList

} from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import ReactQuill from "react-quill";

const CategoryForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [status, setStatus] = useState("Active");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading,setUploading]=useState(false)
  const navigate = useNavigate();

  // Error clear function
  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Fetch all categories for parent selection
  useEffect(() => {
    categoryFetchList()
      .then((res) => setCategories(res.data || []))
      .catch((err) => {
        setCategories([]);
        console.error("Error fetching categories:", err);
        toast.error("Failed to load categories");
      });
  }, []);

  // Fetch category for edit
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      fetchCategory(id)
        .then((res) => {
          const categoryData = res.data;
          setTitle(categoryData?.title || "");
          setDescription(categoryData?.description || "");
          setMetaTitle(categoryData?.meta_title || "");
          setMetaDescription(categoryData?.meta_description || "");
          setMetaKeywords(categoryData?.meta_keywords || "");
          setStatus(categoryData?.status || "Active");
          setImage(categoryData.image)
        })
        .catch(() => {
          toast.error("Failed to load category");
          navigate("/blogs/categories");
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, id, navigate]);


   const fileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      clearError("image"); // ✅ Image upload start hote hi error clear
      
      const formDataData = new FormData();
      formDataData.append("image", file);
  
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
          setImage(res.data.imageUrl);
          // console.log("image url=",res.data.imageUrl)
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image.");
      } finally {
        setUploading(false);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "Category title is required";
    }
    
  const plainDescription = description.replace(/<[^>]*>/g, "").trim();

if (!plainDescription) {
  newErrors.description = "Description is required";
}
    
    if (!metaTitle.trim()) {
      newErrors.metaTitle = "Meta title is required";
    }
    
    if (!metaDescription.trim()) {
      newErrors.metaDescription = "Meta description is required";
    }
    
    if (!metaKeywords.trim()) {
      newErrors.metaKeywords = "Meta keywords are required";
    }

    if(!image.trim()){
      newErrors.image="Image is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload: any = { 
        title, 
        description, 
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        image,
        status
      };
      
      // if (parentId) payload.parent_id = parentId;
      // console.log("=",payload)
      if (isEdit && id) {
        await updateCategory(id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoryCreate(payload);
        toast.success("Category created successfully");
      }
      navigate("/blogs/categories");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          (isEdit ? "Failed to update category" : "Failed to create category")
      );
    } finally {
      setLoading(false);
    }
  };

  // Custom handlers with error clearing
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    clearError("title");
  };

  const handleDescriptionChange = (value:string) => {
    setDescription(value);
    clearError("description");
  };

  const handleMetaTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaTitle(e.target.value);
    clearError("metaTitle");
  };

  const handleMetaDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetaDescription(e.target.value);
    clearError("metaDescription");
  };

  const handleMetaKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaKeywords(e.target.value);
    clearError("metaKeywords");
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    clearError("status");
  };

  // const handleParentChange = (value: string) => {
  //   setParentId(value === "none" ? null : value);
  //   clearError("image");
  // };

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/blogs/categories")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Category" : "Create New Category"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update an existing category."
              : "Add a new category to organize your content."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <CategoryFormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Category Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter category title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                {/* <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter category description"
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div> */}
<div className="space-y-2 md:col-span-2">
  <label htmlFor="description" className="text-sm font-medium">
    Description *
  </label>

  <div className=" overflow-hidden">
    <ReactQuill
      id="description"
      value={description}
      onChange={handleDescriptionChange}
      placeholder="Write your description here"
      theme="snow"
      className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
    />
  </div>

  {errors.description && (
    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
  )}
</div>


                {/* Meta Title */}
                <div className="space-y-2">
                  <label htmlFor="metaTitle" className="text-sm font-medium">
                    Meta Title *
                  </label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={metaTitle}
                    onChange={handleMetaTitleChange}
                    placeholder="Enter meta title for SEO"
                  />
                  {errors.metaTitle && <p className="text-red-500 text-sm mt-1">{errors.metaTitle}</p>}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                </div>

                {/* Meta Description */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="metaDescription" className="text-sm font-medium">
                    Meta Description *
                  </label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={metaDescription}
                    onChange={handleMetaDescriptionChange}
                    placeholder="Enter meta description for SEO"
                    rows={3}
                  />
                  {errors.metaDescription && <p className="text-red-500 text-sm mt-1">{errors.metaDescription}</p>}
                </div>

                {/* Meta Keywords */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="metaKeywords" className="text-sm font-medium">
                    Meta Keywords *
                  </label>
                  <Input
                    id="metaKeywords"
                    name="metaKeywords"
                    value={metaKeywords}
                    onChange={handleMetaKeywordsChange}
                    placeholder="Enter keywords separated by commas"
                  />
                  {errors.metaKeywords && <p className="text-red-500 text-sm mt-1">{errors.metaKeywords}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                                 <label htmlFor="image" className="text-sm font-medium">
                                   Image *
                                 </label>
                                 <Input 
                                   type="file"
                                   name="image"
                                   onChange={fileUpload}
                                   accept="image/*"
                                 />
               
                                 {uploading && (
                                   <div className="flex items-center gap-2 text-blue-600">
                                     <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                                     Uploading...
                                   </div>
                                 )}
               
                                 {image && !uploading && (
                                   <img
                                     src={image}
                                     alt="Preview"
                                     className="w-24 h-24 rounded border mt-2"
                                   />
                                 )}
                                 {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                               </div>
              </div>

              <CardFooter className="flex justify-between px-0 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/blogs/categories")}
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
                    ? "Update Category"
                    : "Create Category"}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const CategoryFormSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export default CategoryForm;