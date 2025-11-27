import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { fetchBlog, createBlog, updateBlog, uploadImage, fetchBlogCategory } from "@/lib/api"; // <-- import your API
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// const BLOG_CATEGORIES = [
//   "Travel Guide",
//   "Food & Cuisine",
//   "Cultural",
//   "Adventure",
//   "Travel Tips",
//   "Accommodation",
//   "Transportation",
//   "Shopping",
//   "Food"
// ];

const BlogForm = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const isEdit = !!id;

  const [blog, setBlog] = useState({
    title: "",
    author: "",
    categoryId: "",
    summary: "",
    content: "",
    featuredImage: "",
    publishDate: null as Date | null,
    showingOnHomePage: false,
    status: "Draft",
    tags: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState([])
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategory = async () => {
      try {

        const res = await fetchBlogCategory()
        setCategory(res.data)
        //  console.log()
        console.log("category=", res)
      }
      catch (e) {
        toast.error("failde to load category")
      }
    }
    fetchCategory()
  }, [])
  useEffect(() => {
    const loadBlog = async () => {
      if (isEdit && id) {
        setIsLoading(true);
        try {
          const res = await fetchBlog(id);
          console.log("Fetched blog data:", res.data);
          const data = res.data;
          setBlog({
            title: data.title || "",
            author: data.author || "", // You may want to fetch author name if needed
            categoryId: data.categoryId || "",
            summary: data.summary || "",
            content: data.content || "",
            featuredImage: data.featuredImage || "",
            publishDate: data.published_at ? new Date(data.published_at) : null,
            showingOnHomePage: data.showingOnHomePage || false,
            status: data.status,
            tags: Array.isArray(data.tags)
              ? data.tags.join(", ")
              : (JSON.parse(data.tags || "[]") || []).join(", "),
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || "",
          });
        } catch (error) {
          toast.error("Failed to fetch blog details.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadBlog();

  }, [id, isEdit]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }))
  };

  const handleSelectChange = (name: string, value: string|boolean) => {
    setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }))
  };

  const handleDateChange = (date: Date | null) => {
    setBlog((prevBlog) => ({ ...prevBlog, publishDate: date }));
    setErrors((prevErrors) => ({ ...prevErrors, publishDate: "" }));

  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true)
    try {
      const url = await uploadImage(file);
      setBlog(prev => ({ ...prev, featuredImage: url }));
      setErrors((prevErrors) => ({ ...prevErrors, featuredImage: "" }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false)
    }

  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: any = {}
    if (!blog.title.trim()) newErrors.title = "Title is required";
    if (!blog.author.trim()) newErrors.author = "Author is required";
    if (!blog.categoryId.trim()) newErrors.categoryId = "Category is required";
    if (!blog.summary.trim()) newErrors.summary = "Summary is required";
    if (!blog.content.trim()) newErrors.content = "Content is required";
    if (!blog.featuredImage) newErrors.featuredImage = "Featured image is required";
    if (!blog.publishDate) newErrors.publishDate = "Publish date is required";
    if (!blog.status.trim()) newErrors.status = "Status is required";
    if (!blog.tags.trim()) newErrors.tags = "Tags are required";
    if (!blog.meta_title.trim()) newErrors.meta_title = "Meta title is required";
    if (!blog.meta_description.trim()) newErrors.meta_description = "Meta description is required";
    if (!blog.meta_keywords.trim()) newErrors.meta_keywords = "Meta keywords are required";

    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false)
      setErrors(newErrors)
      return
    }
    // Validate form
    // if (!blog.title || !blog.categoryId) {
    //   toast.error("Please fill in all required fields.");
    //   setIsLoading(false);
    //   return;
    // }

    // Prepare payload
    const payload = {
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      author: blog.author,
      meta_title: blog.meta_title,
      meta_description: blog.meta_description,
      meta_keywords: blog.meta_keywords,
      featuredImage: blog.featuredImage,
      gallery_images: [], // Add support if you want
      categoryId: blog.categoryId,
      tags: blog.tags.split(",").map((t) => t.trim()).filter(Boolean),
      showingOnHomePage: blog.showingOnHomePage,
      status: blog.status,
      published_at: blog.publishDate ? blog.publishDate.toISOString().slice(0, 19).replace("T", " ") : null,
    };

    try {
      if (isEdit && id) {
        await updateBlog(id, payload);
        toast.success("Blog updated successfully!");
      } else {
        await createBlog(payload);
        toast.success("New blog created successfully!");
      }
      navigate("/blogs");
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <BlogFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/blogs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </div>
      {isLoading ? (
        <BlogFormSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update an existing blog post on your website."
                : "Create engaging content for your travel website."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 ">
                  <label htmlFor="title" className="text-sm font-medium">
                    Blog Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={blog.title}
                    onChange={handleChange}
                    placeholder="Enter blog title"

                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2 ">
                  <label htmlFor="author" className="text-sm font-medium">
                    Author Name
                  </label>
                  <Input
                    id="author"
                    name="author"
                    value={blog.author}
                    onChange={handleChange}
                    placeholder="Enter  author name"

                  />
                  {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Select
                    value={blog.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {category.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={blog.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
               
                <div className="space-y-2">
                  <label htmlFor="publishDate" className="text-sm font-medium">
                    Publish Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !blog.publishDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {blog.publishDate ? (
                          format(blog.publishDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={blog.publishDate || undefined}
                        onSelect={handleDateChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.publishDate && <p className="text-sm text-red-500">{errors.publishDate}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    value={blog.tags}
                    onChange={handleChange}
                    placeholder="Enter tags separated by commas"
                  />
                  {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
                </div>
                 <div className="space-y-2 ">
                  <label htmlFor="showingOnHomePage" className="text-sm font-medium">
                    Showing on Home Page
                  </label>
                  <Select
                    value={blog.showingOnHomePage ? "Yes" : "No"}
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
                <div className="space-y-2">
                  <label htmlFor="featuredImage" className="text-sm font-medium">
                    Featured Image
                  </label>
                  <Input
                    id="featuredImage"
                    name="featuredImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                      Uploading...
                    </div>
                  )}
                  {blog.featuredImage && !uploading && (
                    <div className="mt-2">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-24 h-24 rounded border mt-2"
                      />
                    </div>
                  )}
                  {errors.featuredImage && <p className="text-sm text-red-500">{errors.featuredImage}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="summary" className="text-sm font-medium">
                    Summary
                  </label>
                  <Textarea
                    id="summary"
                    name="summary"
                    value={blog.summary}
                    onChange={handleChange}
                    placeholder="Enter a brief summary"
                    rows={2}
                  />
                  {errors.summary && <p className="text-sm text-red-500">{errors.summary}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Blog Content
                  </label>
                  <ReactQuill
                    id="content"
                    value={blog.content}
                    onChange={(value) => {
                      setBlog((prev) => ({ ...prev, content: value }));
                      setErrors((prevErrors) => ({ ...prevErrors, content: "" }));
                    }}

                    placeholder="Write your blog content here"
                    theme="snow"
                    className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
                  />
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="meta_title" className="text-sm font-medium">
                    Meta Title
                  </label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={blog.meta_title}
                    onChange={handleChange}
                    placeholder="Enter meta title"
                  />
                  {errors.meta_title && <p className="text-sm text-red-500">{errors.meta_title}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="meta_description" className="text-sm font-medium">
                    Meta Description
                  </label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={blog.meta_description}
                    onChange={handleChange}
                    placeholder="Enter meta description"
                    rows={2}

                  />
                  {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="meta_keywords" className="text-sm font-medium">
                    Meta Keywords
                  </label>
                  <Input
                    id="meta_keywords"
                    name="meta_keywords"
                    value={blog.meta_keywords}
                    onChange={handleChange}
                    placeholder="Enter meta keywords"
                  />
                  {errors.meta_keywords && <p className="text-sm text-red-500">{errors.meta_keywords}</p>}
                </div>
              </div>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/blogs")}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    "Saving..."
                  ) : isEdit ? (
                    "Update Blog"
                  ) : (
                    "Save Blog"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const BlogFormSkeleton = () => (
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

export default BlogForm;
