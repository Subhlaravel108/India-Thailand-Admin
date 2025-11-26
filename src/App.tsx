import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// Auth pages
import Login from "./pages/Login";
import ForgetPass from "./pages/ForgetPass";
import Logout from "./pages/Logout";
import ChangePassword from "./pages/ChangePassword";
// Layout
import AdminLayout from "./components/layout/AdminLayout";
// Dashboard
import Dashboard from "./pages/Dashboard";

// Blogs
import BlogsList from "./pages/Blogs/BlogsList";
import BlogForm from "./pages/Blogs/BlogForm";

// Bookings and contacts and Users
import UsersList from "./pages/Users/UsersList";


// Settings
import Settings from "./pages/Settings";

//api keys 
// import UpdateApiKey from "./pages/ApiKeys/UpdateViatorApiKey";

// categories
import CategoriesList from "./pages/Categories/CategoryList";
import CategoryForm from "./pages/Categories/CategoryForm";

// NotFound
import NotFound from "./pages/NotFound";


import TourList from "./pages/Tours/TourList";
import TourForm from "./pages/Tours/TourForm";
import TourPackageList from "./pages/TourPackage/TourPackageList";
import TourPackageForm from "./pages/TourPackage/TourPackageForm";
import DestinationList from "./pages/destination/DestinationList";
import DestinationForm from "./pages/destination/DestinationForm";
import ContactList from "./pages/contact/contact";
import Bookings from "./pages/bookings/bookingList";
import FeedbackList from "./pages/Feedbacks/FeedbackList";
import DownloadResources from "./pages/Download-json";

const queryClient = new QueryClient();

// Auth protection for routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    // Check if user is not authenticated and not already on login page
    if (!isAuthenticated && location.pathname !== "/") {
      console.log("User not authenticated, redirecting to login");
    }
  }, [isAuthenticated, location]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};



const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      {/* <Sonner /> */}
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgetPass />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected routes with admin layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            
           
            
            {/* Blogs routes */}
            <Route path="/blogs" element={<BlogsList />} />
            <Route path="/blogs/add" element={<BlogForm />} />
            <Route path="/blogs/edit/:id" element={<BlogForm />} />

             {/* Tours routes */}

            <Route path="/tours" element={<TourList />} />
            <Route path="/tours/add" element={<TourForm />} />
            <Route path="/tours/edit/:id" element={<TourForm />} />

            {/* Tour Packages routes */}

            <Route path="/tours/packages" element={<TourPackageList/>}/>
            <Route path="/tours/packages/add" element={<TourPackageForm/>}/>
            <Route path="/tours/packages/edit/:id" element={<TourPackageForm/>}/>
            
            {/* Bookings, contacts and users routes */}
            <Route path="/users" element={<UsersList />} />

            <Route path="/contacts" element={<ContactList/>}/>
            <Route path="/bookings" element={<Bookings/>}/>
            <Route path="/feedbacks" element={<FeedbackList/>}/>


             {/* Categories routes */}
            <Route path="/blogs/categories" element={<CategoriesList />} />
            <Route path="/blogs/categories/add" element={<CategoryForm />} />
            <Route path="/blogs/categories/edit/:id" element={<CategoryForm />} />

            {/* Destination routes */}
            <Route path="/destination" element={<DestinationList/>}/>
            <Route path="/destination/add" element={<DestinationForm/>}/>
            <Route path="/destination/edit/:id" element={<DestinationForm/>}/>

          
            {/* Download JSON resources */}
            <Route path="/downloads" element={<DownloadResources />} />
          
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            {/* <Route path="/Api-keys" element={<UpdateApiKey />} /> */}
            {/* <Route path="/settings/social-media" element={<SocialMediaSettings />} /> */}

           
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
