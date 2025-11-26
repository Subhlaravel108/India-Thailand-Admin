"use client";
import { Loader } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const BASE_URL = "https://india-thailand-api-8.onrender.com";

const DownloadDataPage = () => {
  // 🔹 Loading state per item index
  const [loadingIndex, setLoadingIndex] = useState(null);

  const downloadFile = async (url, filename, index) => {
    try {
      setLoadingIndex(index);

      // 🔐 Token check
      const token =
        JSON.parse(localStorage.getItem("user") || "{}")?.token || "";

      if (!token) {
        toast.error("Token missing! Please login again.");
        return;
      }

      // 🔹 Fetching with Authorization
      const response = await fetch(BASE_URL + url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error(`Download failed: ${response.statusText}`);
        return;
      }

      // Convert blob → file
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      toast.success(`${filename} downloaded successfully!`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Check console.");
    } finally {
      setLoadingIndex(null);
    }
  };

  const items = [
    {
      title: "Destinations",
      description: "Download home page destinations JSON.",
      url: "/api/destinations?download=true&limit=6",
      file: "destinations.json",
    },
    {
      title: "Packages",
      description: "Download home page packages JSON.",
      url: "/api/package?download=true&limit=3",
      file: "packages.json",
    },
    {
      title: "Blogs",
      description: "Download home page blogs JSON.",
      url: "/api/blog?download=true&limit=3",
      file: "blogs.json",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Download Website Data
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="border p-5 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-4 text-sm">{item.description}</p>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full flex justify-center"
                onClick={() => downloadFile(item.url, item.file, index)}
                disabled={loadingIndex === index}
              >
                {loadingIndex === index ? <Loader className="animate-spin" /> : "Download JSON"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DownloadDataPage;
