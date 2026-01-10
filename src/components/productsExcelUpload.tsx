import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

interface ProductsExcelUploadProps {
  onSuccess?: () => void;
}

const ProductsExcelUpload = ({ onSuccess }: ProductsExcelUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    // Validate file type
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
      
      const res = await api.post(
        `/upload/product-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Products uploaded successfully!");
        onSuccess && onSuccess(); // Refresh list
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("excel-file-input") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <Input
        id="excel-file-input"
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="max-w-xs"
        disabled={loading}
      />
      <Button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? "Uploading..." : "Upload Excel"}
      </Button>
    </div>
  );
};

export default ProductsExcelUpload;

