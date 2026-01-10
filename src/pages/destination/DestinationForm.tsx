import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";
import { fetchDestination, createDestination, updateDestination, uploadImage } from "@/lib/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DestinationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [destination, setDestination] = useState({
    title: "",
    description: "",
    short_description:"",
    featured_image: "",
    gallery: [] as string[],
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    showingOnHomePage:false,
    status: "Active",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch destination for edit
  useEffect(() => {
    const loadDestination = async () => {
      if (isEdit && id) {
        setIsLoading(true);
        try {
          const res = await fetchDestination(id);
          console.log("Fetched destination data:", res.data);
          const data = res.data;
          
          setDestination({
            title: data.title || "",
            description: data.description || "",
            short_description:data.short_description || "",
            featured_image: data.featured_image || "",
            gallery: data.gallery || [],
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || "",
            showingOnHomePage:data.showingOnHomePage||false,
            status: data.status || "Active",
          });
        } catch (error) {
          toast.error("Failed to fetch destination details.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadDestination();
  }, [id, isEdit]);

  // Clear error when user types
  const clearError = (fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ""
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDestination(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleSelectChange = (name: string, value: string|boolean) => {
    setDestination(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setDestination(prev => ({ ...prev, featured_image: url }));
      clearError("featured_image");
      toast.success("Featured image uploaded!");
    } catch (error) {
      toast.error("Featured image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setGalleryUploading(true);
    try {
      // Upload multiple files
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      // Add new images to existing gallery
      setDestination(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...urls]
      }));
      clearError("gallery");
      toast.success(`${files.length} images uploaded to gallery!`);
    } catch (error) {
      toast.error("Gallery images upload failed");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setDestination(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
    toast.success("Image removed from gallery");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!destination.title.trim()) newErrors.title = "Destination title is required";
    if (!destination.description.trim()) newErrors.description = "Description is required";
    if (!destination.short_description.trim()) newErrors.short_description = "Short description is required";
    if (!destination.featured_image) newErrors.featured_image = "Featured image is required";
    if (!destination.meta_title.trim()) newErrors.meta_title = "Meta title is required";
    if (!destination.meta_description.trim()) newErrors.meta_description = "Meta description is required";
    if (!destination.meta_keywords.trim()) newErrors.meta_keywords = "Meta keywords are required";
    if(destination.gallery.length===0) newErrors.gallery="Atleast one image is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Prepare payload - exact API structure
    const payload = {
      title: destination.title,
      description: destination.description,
      short_description:destination.short_description,
      featured_image: destination.featured_image,
      gallery: destination.gallery,
      meta_title: destination.meta_title,
      meta_description: destination.meta_description,
      meta_keywords: destination.meta_keywords,
      showingOnHomePage:destination.showingOnHomePage,
      status: destination.status,
    };

    try {
      if (isEdit && id) {
        await updateDestination(id, payload);
        toast.success("Destination updated successfully!");
      } else {
        await createDestination(payload);
        toast.success("New destination created successfully!");
      }
      navigate("/destination");
    } catch (error: any) {
      console.error("Error saving destination:", error);
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DestinationFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/destination")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Destinations
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Destination" : "Create New Destination"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update an existing destination on your travel website."
              : "Add a new destination to showcase on your travel website."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Destination Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={destination.title}
                  onChange={handleChange}
                  placeholder="Enter destination title"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>


              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={destination.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            

            {/* showingOnHomePage */}
            <div className="space-y-2">
                <label htmlFor="showingOnHomePage" className="text-sm font-medium">
                  Show on Homepage
                </label>
                <Select
                  value={destination.showingOnHomePage ? "Yes" : "No"}
                  onValueChange={(value) => handleSelectChange("showingOnHomePage", value === "Yes" ? true : false)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <label htmlFor="shortDescription" className="text-sm font-medium">
                Short Description *
              </label>
              <ReactQuill
                value={destination.short_description}
                onChange={(value) => {
                  setDestination(prev => ({ ...prev, short_description: value }));
                  clearError("short_description");
                }}
                placeholder="Write short description about the destination"
                theme="snow"
                className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
              />
              {errors.short_description && <p className="text-sm text-red-500">{errors.short_description}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Detailed Description *
              </label>
              <ReactQuill
                value={destination.description}
                onChange={(value) => {
                  setDestination(prev => ({ ...prev, description: value }));
                  clearError("description");
                }}
                placeholder="Write detailed description about the destination"
                theme="snow"
                className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Images Section */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div className="space-y-2">
                <label htmlFor="featured_image" className="text-sm font-medium">
                  Featured Image *
                </label>
                <div className="space-y-3">
                  <Input
                    id="featured_image"
                    name="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                      Uploading featured image...
                    </div>
                  )}
                  {destination.featured_image && !uploading && (
                    <div className="mt-2">
                      <img
                        src={destination.featured_image}
                        alt="Featured"
                        className="w-40 h-32 object-cover rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                  {errors.featured_image && <p className="text-sm text-red-500">{errors.featured_image}</p>}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <label htmlFor="gallery" className="text-sm font-medium">
                  Gallery Images (Multiple Select)
                </label>
                <div className="space-y-3">
                  <Input
                    id="gallery"
                    name="gallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageUpload}
                  />
                  {galleryUploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                      Uploading gallery images...
                    </div>
                  )}
                  
                  {/* Gallery Images Preview */}
                  {destination.gallery.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        {destination.gallery.length} image(s) in gallery
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {destination.gallery.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border shadow-sm"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.gallery && <p className="text-sm text-red-500">{errors.gallery}</p>}
              </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">SEO Settings</h3>
              
              <div className="space-y-2">
                <label htmlFor="meta_title" className="text-sm font-medium">
                  Meta Title *
                </label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  value={destination.meta_title}
                  onChange={handleChange}
                  placeholder="Enter meta title for SEO"
                />
                {errors.meta_title && <p className="text-sm text-red-500">{errors.meta_title}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_description" className="text-sm font-medium">
                  Meta Description *
                </label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={destination.meta_description}
                  onChange={handleChange}
                  placeholder="Enter meta description for SEO"
                  rows={3}
                />
                {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_keywords" className="text-sm font-medium">
                  Meta Keywords *
                </label>
                <Input
                  id="meta_keywords"
                  name="meta_keywords"
                  value={destination.meta_keywords}
                  onChange={handleChange}
                  placeholder="Enter keywords separated by commas"
                />
                {errors.meta_keywords && <p className="text-sm text-red-500">{errors.meta_keywords}</p>}
              </div>
            </div>

            <CardFooter className="flex justify-between px-0 pt-6">
              <Button variant="outline" onClick={() => navigate("/destination")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEdit ? "Update Destination" : "Create Destination"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const DestinationFormSkeleton = () => (
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

export default DestinationForm;