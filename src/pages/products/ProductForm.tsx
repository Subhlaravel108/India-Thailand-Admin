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
import { ArrowLeft } from "lucide-react";
import { fetchProduct, createProduct, updateProduct, productCategoryFetchList } from "@/lib/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ProductForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [product, setProduct] = useState({
    title: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    slug: "",
    sku: "",
    image_url: "",
    product_price: "",
    description: "",
    productCategoryId: "",
    showingOnHomePage: false,
    status: "active",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch product categories
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await productCategoryFetchList({ page: 1, search: "" });
        // Handle different response structures
        if (res.success) {
          if (Array.isArray(res.data)) {
            setProductCategories(res.data);
          } else if (res.data && Array.isArray(res.data.data)) {
            setProductCategories(res.data.data);
          } else if (Array.isArray(res)) {
            setProductCategories(res);
          }
        } else if (Array.isArray(res)) {
          setProductCategories(res);
        } else if (res.data && Array.isArray(res.data)) {
          setProductCategories(res.data);
        }
      } catch (error) {
        console.error("Failed to load product categories:", error);
        toast.error("Failed to load product categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch product for edit
  useEffect(() => {
    const loadProduct = async () => {
      if (isEdit && slug) {
        setIsLoading(true);
        try {
          const res = await fetchProduct(slug);
          console.log("Fetched product data:", res.data);
          const data = res.data;
          
          setProduct({
            title: data.title || "",
            meta_title: data.meta_title || "",
            meta_keywords: data.meta_keywords || "",
            meta_description: data.meta_description || "",
            slug: data.slug || "",
            sku: data.sku || "",
            image_url: data.image_url || "",
            product_price: data.product_price || "",
            description: data.description || "",
            productCategoryId: data.productCategoryId || data.product_category_id || "",
            showingOnHomePage: data.showingOnHomePage || false,
            status: data.status || "active",
          });
        } catch (error) {
          toast.error("Failed to fetch product details.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadProduct();
  }, [slug, isEdit]);

  // Clear error when user types
  const clearError = (fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ""
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleSelectChange = (name: string, value: string|boolean) => {
    setProduct(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!product.title.trim()) newErrors.title = "Product title is required";
    if (!product.meta_title.trim()) newErrors.meta_title = "Meta title is required";
    if (!product.meta_keywords.trim()) newErrors.meta_keywords = "Meta keywords are required";
    if (!product.meta_description.trim()) newErrors.meta_description = "Meta description is required";
    if (!product.slug.trim()) newErrors.slug = "Slug is required";
    if (!product.sku.trim()) newErrors.sku = "SKU is required";
    if (!product.image_url.trim()) newErrors.image_url = "Image URL is required";
    if (!product.product_price || (typeof product.product_price === 'string' && !product.product_price.trim()) || (typeof product.product_price === 'number' && isNaN(product.product_price))) newErrors.product_price = "Product price is required";
    if (!product.productCategoryId || !product.productCategoryId.trim()) newErrors.productCategoryId = "Product category is required";
    if (!product.description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Prepare payload - exact API structure
    const payload = {
      title: product.title,
      meta_title: product.meta_title,
      meta_keywords: product.meta_keywords,
      meta_description: product.meta_description,
      slug: product.slug,
      sku: product.sku,
      image_url: product.image_url,
      product_price: product.product_price,
      productCategoryId: product.productCategoryId,
      showingOnHomePage: product.showingOnHomePage,
      description: product.description,
      status: product.status,
    };

    try {
      if (isEdit && slug) {
        await updateProduct(slug, payload);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(payload);
        toast.success("New product created successfully!");
      }
      navigate("/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProductFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Product" : "Create New Product"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update an existing product."
              : "Add a new product."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={product.title}
                onChange={handleChange}
                placeholder="Enter product title"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  Slug *
                </label>
                <Input
                  id="slug"
                  name="slug"
                  value={product.slug}
                  onChange={handleChange}
                  placeholder="Enter product slug"
                />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">
                  SKU *
                </label>
                <Input
                  id="sku"
                  name="sku"
                  value={product.sku}
                  onChange={handleChange}
                  placeholder="Enter product SKU"
                />
                {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium">
                Image URL *
              </label>
              <Input
                id="image_url"
                name="image_url"
                value={product.image_url}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
              {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
              {product.image_url && (
                <div className="mt-2">
                  <img
                    src={product.image_url}
                    alt="Product"
                    className="w-40 h-32 object-cover rounded-lg border shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="productCategoryId" className="text-sm font-medium">
                Product Category *
              </label>
              <Select
                value={product.productCategoryId}
                onValueChange={(value) => handleSelectChange("productCategoryId", value)}
                disabled={loadingCategories}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select product category"} />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.length === 0 && !loadingCategories ? (
                    <SelectItem value="" disabled>No categories available</SelectItem>
                  ) : (
                    productCategories.map((category) => (
                      <SelectItem key={category._id || category.id} value={category._id || category.id}>
                        {category.name || category.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.productCategoryId && <p className="text-sm text-red-500">{errors.productCategoryId}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="product_price" className="text-sm font-medium">
                  Product Price *
                </label>
                <Input
                  id="product_price"
                  name="product_price"
                  type="number"
                  step="0.01"
                  value={product.product_price}
                  onChange={handleChange}
                  placeholder="Enter product price"
                />
                {errors.product_price && <p className="text-sm text-red-500">{errors.product_price}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status *
                </label>
                <Select
                  value={product.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description *
              </label>
              <ReactQuill
                value={product.description}
                onChange={(value) => {
                  setProduct(prev => ({ ...prev, description: value }));
                  clearError("description");
                }}
                placeholder="Write product description"
                theme="snow"
                className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
                  value={product.meta_title}
                  onChange={handleChange}
                  placeholder="Enter meta title for SEO"
                />
                {errors.meta_title && <p className="text-sm text-red-500">{errors.meta_title}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_keywords" className="text-sm font-medium">
                  Meta Tag Keywords *
                </label>
                <Input
                  id="meta_keywords"
                  name="meta_keywords"
                  value={product.meta_keywords}
                  onChange={handleChange}
                  placeholder="Enter keywords separated by commas"
                />
                {errors.meta_keywords && <p className="text-sm text-red-500">{errors.meta_keywords}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="meta_description" className="text-sm font-medium">
                  Meta Tag Description *
                </label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={product.meta_description}
                  onChange={handleChange}
                  placeholder="Enter meta description for SEO"
                  rows={3}
                />
                {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
              </div>
              <div className="space-y-2 ">
                                <label htmlFor="showingOnHomePage" className="text-sm font-medium">
                                  Showing on Home Page
                                </label>
                                <Select
                                  value={product.showingOnHomePage ? "Yes" : "No"}
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

            <CardFooter className="flex justify-between px-0 pt-6">
              <Button variant="outline" onClick={() => navigate("/product")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ProductFormSkeleton = () => (
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

export default ProductForm;