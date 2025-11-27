import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Plus, Trash2, Upload, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api, { createTour, updateBlog, updateTour } from "@/lib/api";
import { toast } from "sonner";
import { set } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAllTourPackages, fetchTour,fetchDestinations } from "@/lib/api";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import ReactQuill from "react-quill";
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
function TourForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [TourPackages, setTourPackages] = useState([]);
  const [destination,setDestination]=useState([])
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchAllTourPackages()
      .then((packages) => {
        console.log("Fetched packages:", packages);
        setTourPackages(packages.data);
      })
      .catch((error) => {
        console.error("Error fetching packages:", error);
        setTourPackages([]);
      });
  }, []);
  useEffect(() => {
    fetchDestinations()
      .then((des) => {
        console.log("Fetched des:", des);
        setDestination(des.data);
      })
      .catch((error) => {
        console.error("Error fetching destination:", error);
        setDestination([]);
      });
  }, []);


  useEffect(() => {
    const fetchTourData = async () => {
      if (isEdit && id) {
        setLoading(true);
        try {
          const res = await fetchTour(id);
          console.log("Fetched tour data:", res);
          // Populate form data with fetched tour details
          setFormData({
            title: res.data.title || '',
            meta_title: res.data.meta_title || '',
            meta_keywords: res.data.meta_keywords || '',
            meta_description: res.data.meta_description || '',
            shortDescription: res.data.shortDescription || '',
            featureImage: res.data.featureImage || '',
            tour_duration: res.data.tour_duration || '',
            description: res.data.description || '',
            price: res.data.price || '',
            people: res.data.people || '',
            countries: res.data.countries || '',
            hotelType: res.data.hotelType || '',
            travelInsuranceIncluded: res.data.travelInsuranceIncluded || false,
            packageId: res.data.packageId || '',
            status:res.data.status || ''
          });
          setItinerary(res.data.itinerary && res.data.itinerary.length > 0 ? res.data.itinerary : [{ title: '', detail: '' }]);
          setGalleryImages(res.data.gallery && res.data.gallery.length > 0 ? res.data.gallery : []);
          setIncludedItems(res.data.included && res.data.included.length > 0 ? res.data.included : ['']);
          setNotIncludedItems(res.data.notIncluded && res.data.notIncluded.length > 0 ? res.data.notIncluded : ['']);
             setSelectedDestinations(
          res.data.destinationIds && res.data.destinationIds.length > 0
            ? res.data.destinationIds
            : []
        ); 
        } catch (error) {
          console.error("Error fetching tour data:", error);
          toast.error("Failed to load tour data.");
        } finally {
          setLoading(false);
        }
      }
    };

    // const time=setTimeout(() => {

    fetchTourData();
    // }, 1000);

    // return () => clearTimeout(time);

  }, [isEdit, id]);

  // State for form fields
  const [formData, setFormData] = useState({
    title: '',
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    shortDescription: '',
    featureImage: '',
    tour_duration: '',
    description: '',
    price: '',
    people: '',
    countries: '',
    hotelType: '',
    travelInsuranceIncluded: false,
    packageId: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // State for arrays
  const [itinerary, setItinerary] = useState([{ title: '', detail: '' }]);
  // const [galleryImages, setGalleryImages] = useState(['', '']);
  const [includedItems, setIncludedItems] = useState(['', '', '']);
  const [notIncludedItems, setNotIncludedItems] = useState(['', '']);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
 const [addMoreKey, setAddMoreKey] = useState(Date.now());

  console.log("des id=",selectedDestinations)

  const handleCheckboxChange = (id) => {
  setSelectedDestinations((prev) =>
    prev.includes(id)
      ? prev.filter((destId) => destId !== id)
      : [...prev, id]
  );
};


  // Handle input changes for main form fields
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ""
    }))
  };

  // Itinerary functions
  const handleAddItinerary = () => {
    setItinerary([...itinerary, { title: '', detail: '' }]);

  };

  const handleItineraryChange = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
    setErrors((prevErrors) => ({ ...prevErrors, itinerary: "" }));
  };

  const handleRemoveItinerary = (index) => {
    if (itinerary.length > 1) {
      const updated = itinerary.filter((_, i) => i !== index);
      setItinerary(updated);
    }
  };

  // Gallery images functions
  // const handleGalleryChange = (index, value) => {
  //   const updated = [...galleryImages];
  //   updated[index] = value;
  //   setGalleryImages(updated);
  // };

  // const handleAddGalleryImage = () => {
  //   setGalleryImages([...galleryImages, '']);
  // };

  // const handleRemoveGalleryImage = (index) => {
  //   if (galleryImages.length > 1) {
  //     const updated = galleryImages.filter((_, i) => i !== index);
  //     setGalleryImages(updated);
  //   }
  // };

  // Included items functions
  const handleIncludedChange = (index, value) => {
    const updated = [...includedItems];
    updated[index] = value;
    setIncludedItems(updated);
    setErrors(prev => ({ ...prev, include: "" }));
  };

  const handleAddIncludedItem = () => {
    setIncludedItems([...includedItems, '']);
  };

  const handleRemoveIncludedItem = (index) => {
    if (includedItems.length > 1) {
      const updated = includedItems.filter((_, i) => i !== index);
      setIncludedItems(updated);
    }
  };

  // Not included items functions
  const handleNotIncludedChange = (index, value) => {
    const updated = [...notIncludedItems];
    updated[index] = value;
    setNotIncludedItems(updated);
    setErrors(prev => ({ ...prev, notInclude: "" }));
  };

  const handleAddNotIncludedItem = () => {
    setNotIncludedItems([...notIncludedItems, '']);
  };

  const handleRemoveNotIncludedItem = (index) => {
    if (notIncludedItems.length > 1) {
      const updated = notIncludedItems.filter((_, i) => i !== index);
      setNotIncludedItems(updated);
    }
  };



  const handleFeatureImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
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
      }
      setFormData((prev) => ({
        ...prev,
        featureImage: res.data.imageUrl,
      }));
      setErrors(prev => ({ ...prev, featureImage: "" }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image.");
    }
    finally {
      setUploading(false);
    }
  };

  // Multiple gallery upload handler
const handleMultipleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files?.length) return;

  setUploadingGallery(true);

  const promises = Array.from(files).map(async (file) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" is too large (Max 5MB)`);
        return null;
      }

      const valid = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!valid.includes(file.type)) {
        toast.error(`Invalid file: ${file.name}`);
        return null;
      }

      const fd = new FormData();
      fd.append("image", file);

      const res = await api.post("/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.success ? res.data.imageUrl : null;
    } catch {
      toast.error(`Failed: ${file.name}`);
      return null;
    }
  });

  const results = await Promise.all(promises);
  const success = results.filter((x) => x);

  if (success.length) {
    setGalleryImages((prev) => [...prev, ...success]);
    toast.success(`Uploaded ${success.length} of ${files.length} images`);
  }

  setUploadingGallery(false);
  e.target.value = "";
};

// Remove gallery image
const handleRemoveGalleryImage = (index: number) => {
  setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  toast.success("Image removed");
};


// // Add empty slot for gallery (optional)
// const handleAddGalleryImage = () => {
//   setGalleryImages(prev => [...prev, '']);
// };

  if (loading) {
    return <BlogFormSkeleton />;
  }


  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 🔹 Step 1: Validate form
    const errors: any = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.meta_title?.trim()) {
      errors.meta_title = "Meta title is required";
    }
    if (!formData.meta_description?.trim()) {
      errors.meta_description = "Meta description is required";
    }
    if (!formData.meta_keywords?.trim()) {
      errors.meta_keywords = "Meta keywords is required";
    }
    const plainDescription = formData.shortDescription.replace(/<[^>]*>/g, "").trim();

    if (!plainDescription) {
      errors.shortDescription = "short description is required";
    }

    const plainLongDescription = formData.description.replace(/<[^>]*>/g, "").trim();

    if (!plainLongDescription) {
      errors.description = "long description is required";
    }
    if (!formData.featureImage?.trim()) {
      errors.featureImage = "Feature image is required";
    }
    if (!formData.tour_duration?.trim()) {
      errors.tour_duration = "Tour duration is required";
    }
    // if (!formData.price) {
    //   errors.price = "Price is required";
    // }
    // else if(!Number(formData.price) ){
    //     errors.price="Price must be a number" 
    // }
    if (!formData.people?.trim()) {
      errors.people = "People count is required";
    }
    if (!formData.countries?.trim()) {
      errors.countries = "Countries field is required";
    }
    if (!formData.hotelType?.trim()) {
      errors.hotelType = "Hotel type is required";
    }
    if(!formData.status?.trim()){
      errors.status="Status is required"
    }

    // 🔹 Itinerary validation
    const validItinerary = itinerary.filter(item => item.title.trim() && item.detail.trim());
    if (validItinerary.length === 0) {
      errors.itinerary = "At least one itinerary item is required";
    }

    // 🔹 Gallery validation
    const validGallery = galleryImages.filter(url => url.trim() !== '');
    if (validGallery.length === 0) {
      errors.gallery = "At least one gallery image is required";
    }
    const validInclude = includedItems.filter(item => item.trim() !== '');
    if (validInclude.length === 0) {
      errors.include = "At least one  include item is required";
    }
    const validNotInclude = notIncludedItems.filter(item => item.trim() !== '');
    if (validNotInclude.length === 0) {
      errors.notInclude = "At least one not include item is required";
    }
    if (!formData.packageId.trim()) {
      errors.packageId = "Package id is required"
    }

    if (selectedDestinations.length === 0) {
  errors.destination = "At least one destination is required";
}


    // 🔹 If any error found — stop submission
    if (Object.keys(errors).length > 0) {
      setIsLoading(false);
      // Object.values(errors).forEach((msg) => toast.error(msg));
      setErrors(errors);
      return;
    }

    // 🔹 Step 2: Prepare final data object
    const tourData = {
      ...formData,
      itinerary: validItinerary,
      gallery: validGallery,
      destinationIds: selectedDestinations,
      included: includedItems.filter(item => item.trim() !== ''),
      notIncluded: notIncludedItems.filter(item => item.trim() !== '')
    };

    console.log('Tour Data:', tourData);

    // 🔹 Step 3: Submit data to backend
    try {
      if (isEdit && id) {
        await updateTour(id, tourData);
        toast.success("Tour updated successfully!");
      } else {
        await createTour(tourData);
        toast.success("New tour created successfully!");
      }
      navigate("/tours");
    } catch (error: any) {
      console.error("Error saving tour:", error);
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/tours")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tours
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Update Tour" : "Create New Tour"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tour Title</label>
                <Input
                  placeholder="Enter tour title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}

                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Title</label>
                <Input
                  placeholder="Enter meta title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                />
                {errors.meta_title && <p className="text-red-500 text-xs mt-1">{errors.meta_title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Keywords</label>
                <Input
                  placeholder="Comma separated keywords"
                  value={formData.meta_keywords}
                  onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                />
                {errors.meta_keywords && <p className="text-red-500 text-xs mt-1">{errors.meta_keywords}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Input
                  placeholder="Enter meta description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                />
                {errors.meta_description && <p className="text-red-500 text-xs mt-1">{errors.meta_description}</p>}
              </div>


              <div className="space-y-2 md:col-span-2">
                <label htmlFor="ShortDescription" className="text-sm font-medium">
                  Short Description
                </label>
                <ReactQuill
                  id="ShortDescription"
                  value={formData.shortDescription}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, shortDescription: value }));
                    setErrors((prevErrors) => ({ ...prevErrors, shortDescription: "" }));
                  }}

                  placeholder="Write your short description here"
                  theme="snow"
                  className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
                />
                {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="longDescription" className="text-sm font-medium">
                  Long Description
                </label>
                <ReactQuill
                  id="longDescription"
                  value={formData.description}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, description: value }));
                    setErrors((prevErrors) => ({ ...prevErrors, description: "" }));
                  }}

                  placeholder="Write your short description here"
                  theme="snow"
                  className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </div>

            {/* ITINERARY */}
            <div>
              <label className="font-semibold">Itinerary</label>
              {itinerary.map((item, index) => (
                <div key={index} className="border p-4 py-8 rounded mt-2 space-y-2 relative">
                  <button
                    type="button"
                    className="absolute top-2  right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveItinerary(index)}
                    disabled={itinerary.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Input
                    placeholder="Day (e.g., Day 1)"
                    value={item.title}
                    onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                  />
                  {/* <Textarea
                    placeholder="Details"
                    value={item.detail}
                    onChange={(e) => handleItineraryChange(index, 'detail', e.target.value)}
                  /> */}
                  <ReactQuill
                  id="detai"
                  value={item.detail}
                  // onChange={(value) => {
                  //   setFormData((prev) => ({ ...prev, description: value }));
                  //   setErrors((prevErrors) => ({ ...prevErrors, description: "" }));
                  // }}
                   onChange={(value) => handleItineraryChange(index, 'detail', value)}

                  placeholder="Write your detail here"
                  theme="snow"
                  className="min-h-[200px] [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]"
                />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={handleAddItinerary}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add More Itinerary
              </Button>
              {errors.itinerary && <p className="text-red-500 text-xs mt-1">{errors.itinerary}</p>}
            </div>

            {/* FEATURE IMAGE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Feature Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFeatureImageUpload}
              />

              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                  Uploading...
                </div>
              )}

              {formData.featureImage && !uploading && (
                <img
                  src={formData.featureImage}
                  alt="Preview"
                  className="w-24 h-24 rounded border mt-2"
                />
              )}
              {errors.featureImage && <p className="text-red-500 text-xs mt-1">{errors.featureImage}</p>}
            </div>


            {/* GALLERY */}
            <div className="space-y-4">
  <label className="text-sm font-medium text-gray-700">Gallery Images</label>

  {/* Multiple File Upload Box */}
  <div
    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
      uploadingGallery
        ? "border-blue-400 bg-blue-50"
        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/40"
    }`}
  >
    <input
      type="file"
      multiple
      accept="image/*"
      id="multiple-gallery-upload"
      className="hidden"
      onChange={handleMultipleGalleryUpload}
      disabled={uploadingGallery}
    />

    <label
      htmlFor="multiple-gallery-upload"
      className="cursor-pointer flex flex-col items-center gap-3"
    >
      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
        {uploadingGallery ? (
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Upload className="w-7 h-7 text-blue-600" />
        )}
      </div>

      <p className="text-gray-700 font-medium">
        {uploadingGallery ? "Uploading..." : "Click to upload multiple images"}
      </p>
      <p className="text-gray-500 text-sm">PNG, JPG, WebP (Max 5MB each)</p>
    </label>
  </div>

  {/* Uploading Message */}
  {uploadingGallery && (
    <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-600 text-sm">Uploading images... Please wait</p>
    </div>
  )}

  {/* Gallery Images Grid */}
  {galleryImages.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {galleryImages.map((img, index) => (
        <div
          key={index}
          className="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <img
            src={img}
            alt="Gallery"
            className="w-full h-28 object-cover"
          />

          {/* Uploaded Badge */}
          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Check className="w-3 h-3" /> Uploaded
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => handleRemoveGalleryImage(index)}
            className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Image Index */}
          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Add More Button */}
  {/* {galleryImages.length > 0 && (
    <div className="flex justify-center mt-4">
      <input
        key={addMoreKey}
        type="file"
        multiple
        accept="image/*"
        id="add-more-images"
        className="hidden"
           onChange={(e) => {
        handleMultipleGalleryUpload(e);
        setAddMoreKey(Date.now()); // force-remount input
      }}
      />

      <label htmlFor="add-more-images">
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add More Images
        </Button>
      </label>
    </div>
  )} */}

  {errors.gallery && (
    <p className="text-red-500 text-xs mt-1">{errors.gallery}</p>
  )}
</div>

            {/* NUMBERS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tour Duration</label>
                <Input
                  placeholder="5 days, 4 nights"
                  type="text"
                  value={formData.tour_duration}
                  onChange={(e) => handleInputChange('tour_duration', e.target.value)}
                />
                {errors.tour_duration && <p className="text-red-500 text-xs mt-1">{errors.tour_duration}</p>}
              </div>

              {/* <div className="space-y-2">
                                <label className="text-sm font-medium">Nights</label>
                                <Input
                                    placeholder="Nights"
                                    type="number"
                                    value={formData.nights}
                                    onChange={(e) => handleInputChange('nights', e.target.value)}
                                />
                            </div> */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
                {/* {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>} */}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">People</label>
                <Input
                  placeholder="2-3"
                  value={formData.people}
                  onChange={(e) => handleInputChange('people', e.target.value)}
                />
                {errors.people && <p className="text-red-500 text-xs mt-1">{errors.people}</p>}
              </div>
               <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
            </div>

           <div className="space-y-2">
            <label className="text-sm font-medium">Select Destinations</label>
               <div className="grid grid-cols-5 gap-3">
      {destination.map((dest) => (
        <label
          key={dest._id}
          className="flex items-center gap-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={selectedDestinations.includes(dest._id)}
            onChange={() => handleCheckboxChange(dest._id)}
          />
          <span className="text-sm font-medium">{dest.title}</span>
        </label>
      ))}
      {destination.length === 0 && (
  <p className="text-gray-500 text-sm">No destinations found</p>
)}

    </div>
      {errors.destination && <p className="text-sm text-red-500">{errors.destination}</p>}
           </div>

            {/* COUNTRIES */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Countries</label>
              <Input
                placeholder="France, Italy, Switzerland"
                value={formData.countries}
                onChange={(e) => handleInputChange('countries', e.target.value)}
              />
              {errors.countries && <p className="text-red-500 text-xs mt-1">{errors.countries}</p>}
            </div>

            {/* HOTEL TYPE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hotel Type</label>
              <Input
                placeholder="4 Star"
                value={formData.hotelType}
                onChange={(e) => handleInputChange('hotelType', e.target.value)}
              />
              {errors.hotelType && <p className="text-red-500 text-xs mt-1">{errors.hotelType}</p>}
            </div>

            {/* INCLUDED */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Included</label>
              <div className="space-y-2">
                {includedItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Included item ${index + 1}`}
                      value={item}
                      onChange={(e) => handleIncludedChange(index, e.target.value)}
                    />

                    {includedItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveIncludedItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddIncludedItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Included Item
              </Button>
              {errors.include && <p className="text-red-500 text-xs mt-1">{errors.include}</p>}
            </div>

            {/* NOT INCLUDED */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Not Included</label>
              <div className="space-y-2">
                {notIncludedItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Not included item ${index + 1}`}
                      value={item}
                      onChange={(e) => handleNotIncludedChange(index, e.target.value)}
                    />
                    {notIncludedItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveNotIncludedItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddNotIncludedItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Not Included Item
              </Button>
              {errors.notInclude && <p className="text-red-500 text-xs mt-1">{errors.notInclude}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Travel Insurance Included</label>
                <Checkbox
                  checked={formData.travelInsuranceIncluded}
                  onCheckedChange={(checked) => handleInputChange('travelInsuranceIncluded', checked)}
                />
              </div>
            </div>
            {/* PACKAGE ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Package</label>
              <Select
                onValueChange={(value) => handleInputChange('packageId', value)}
                value={formData.packageId ? String(formData.packageId) : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select any one package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TourPackages.map((pkg) => (
                      <SelectItem key={pkg._id} value={String(pkg._id)}>
                        {pkg.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.packageId && <p className="text-red-500 text-xs mt-1">{errors.packageId}</p>}
            </div>



            {/* BUTTON */}
            <Button type="submit" className="w-full"
              disabled={isLoading}

            >
              {isEdit ? "Update Tour" : "Save Tour"}

            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TourForm;