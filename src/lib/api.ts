import axios from "axios";
// import { URLSearchParams } from "url";

const api = axios.create({
  // baseURL: "https://api.jewtone.com/api/v1",
  baseURL: "https://india-thailand-api-8.onrender.com/api/",
});

export default api;

  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";

// Login Apis 
export const loginApi = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

export const requestOtp = async (email: string) => {
  const formData = new FormData();
  formData.append("email", email);
  const response = await api.post("/auth/forgot-password", formData);
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("otp", otp);
  const response = await api.post("/auth/verify-reset-otp", formData);
  return response.data;
};

export const resetPassword = async (email: string, otp: string, password: string, password_confirmation: string) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("otp", otp);
  formData.append("password", password);
  formData.append("password_confirmation", password_confirmation);
  const response = await api.post("/auth/reset-password", formData);
  return response.data;
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
  const res = await api.post(
    "/upload-image",
    formData,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.imageUrl || res.data.path || res.data.data?.url;
};

export const fetchAllTourPackages = async () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
  const res = await api.get("/package", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}





export const changePassword = async (payload: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  // Using FormData so that the request mimics the provided curl command
  const formData = new FormData();
  formData.append("current_password", payload.current_password);
  formData.append("new_password", payload.new_password);
  formData.append("new_password_confirmation", payload.new_password_confirmation);

  const response = await api.post("/change-password", formData, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
  return response.data;
};
// End of Login Apis

//User Apis
export const fetchUsers = async ({ page = 1, search = "" } = {}) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  let url = `/users`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const res = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const ChangeUserStatus = async ({
  user_id,
  status,
}: {
  user_id: string;
  status: string;
}) => {
 

  const response = await api.post(
    `/auth/user/status/${user_id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


//End of User Apis

// Category APIs

export const categoryFetchList = async ({ page = 1, search = "" } = {}) => {
  // const token =
    // JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";

  const response = await api.get(`/blog-categories?`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      name: search || undefined, // will exclude `name` if search is empty
    },
  });

  return response.data;
};

export const fetchAllCategories = async () => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const res = await api.get("/category/list?per_page=1000", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const categoryCreate = async (payload: any) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.post(
    "/blog-category",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );
  return response.data;
};

export const fetchCategory = async (slugOrId: string) => {
 

  const response = await api.get(`/blog-category/${slugOrId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


export const updateCategory = async (slugOrId: string, payload: any) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  console.log("payloag=",payload)
  const response = await api.put( 
    `/blog-category/${slugOrId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );
  return response.data;
}

export const deleteCategory = async (id: string) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.delete(
    `/blog-category/${id}`,
    {
      headers: {
        Accept: "application/json", 
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

//end of Category APIs

// other APIs

export const fetchDestination=async(SlugOrId:string)=>{
    const response=await api.get(`/destination/${SlugOrId}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    return response.data
}

export const createDestination=async(payload:any)=>{
  const response=await api.post("destination",payload,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  return response.data
}

export const updateDestination=async(SlugOrId:string,payload:any)=>{
  const response=await api.put(`/destination/${SlugOrId}`,payload,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  return response.data
}

export const fetchDestinations=async({page=1,search=""}={})=>{
      const response = await api.get(`/destinations?`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      search: search || undefined, // will exclude `name` if search is empty
    },
  });
  return response.data
}

export const deleteDestination=async(SlugOrId:string)=>{
  const response=await api.delete(`destination/${SlugOrId}`,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
}

export const fetchBlogs = async ({ page = 1, search = "" } = {}) => {
  // const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
  const params = new URLSearchParams();
  params.append("page", String(page));
  if (search) params.append("search", search); // search by title
 
  const response = await api.get(`/blog?${params.toString()}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


export const fetchBlog = async (slugOrId: string) => {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
  const response = await api.get(`/blog/${slugOrId}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const createBlog = async (payload: any) => {

  const response = await api.post(
    "/blog",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );
  return response.data;
};

export const updateBlog = async (slugOrId: string, payload: any) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  console.log("Updating blog with ID:", slugOrId, "and payload:", payload);
  const response = await api.put(
    `/blog/${slugOrId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );
  return response.data;
};

export const deleteBlog = async (slug: string) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.delete(
    `/blog/${slug}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchBlogCategory=async({page=1, search=""}={})=>{
  const params=new URLSearchParams();
  params.append("page",String(page))
  if(search) params.append("search",search)
  const response=await api.get(`/blog-categories?${params.toString()}`,{
    headers:{
       Authorization:`Bearer ${token}`
    }
})
   return response.data
}

export const fetchTourPackages=async({page=1, search=""}={})=>{
  const params=new URLSearchParams();
  params.append("page",String(page))
  if(search) params.append("search",search)
    // params.append("limit","1")
  const response=await api.get(`/package?${params.toString()}`,{
    headers:{
       Authorization:`Bearer ${token}`
    }
})
   return response.data
}

export const fetchTourPackage=async(slug:string)=>{
  const response=await api.get(`package/detail/${slug}`,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  return response.data
}

export const createTourPackage=async(payload:any)=>{
  const response=await api.post("/package",payload,{
    headers:{
        Authorization:`Bearer ${token}`
    }

  })
  return response.data
}

export const updateTourPackage = async (slugOrId: string, payload: any) => {
  const response = await api.put(
    `/package/${slugOrId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );
  return response.data;
}

export const deleteTourPackage = async (slug: string) => {
  // const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.delete(
    `/package/${slug}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


export const fetchTours= async ({ page = 1, search = "" } = {}) => {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
  const params = new URLSearchParams();
  params.append("page", String(page));
  console.log("search=",search)
  if (search) params.append("search", search); // search by title
  // params.append("limit", "1");
  const response = await api.get(`/tours?${params.toString()}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export const fetchTour = async (slugOrId: string) => {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token || "";
  const response = await api.get(`/tours/${slugOrId}`,{
    headers:{
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export const createTour = async (payload: any) => {
  const response=await api.post(
    "/tours",payload,{
      headers:{
        Authorization: `Bearer ${token}`
      },
    })
    return response.data;
}

export const updateTour = async (slugOrId: string, payload: any) => {
  const response = await api.put(
    `/tours/${slugOrId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );
  return response.data;
}

export const deleteTour = async (slugOrId: string) => {
  const response = await api.delete(
    `/tours/${slugOrId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export const fetchDashboardStats = async () => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const res = await api.get("/dashboard/stats", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};


export const fetchApiKey = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get(`/viatorkeylist/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return response.data;
};

export const fetchViatorKey = async () => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get("/api-key/list", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  // Assuming the API returns an array; adjust if needed.
  return response.data; // Returns the first API key object.
};

export const updateViatorApiKey = async (id: string, key: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.put(
    `/api-key/update/${id}`,
    { key },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

//end of other APIs

// Product APIs

export const fetchProducts = async ({ page = 1, search = "" } = {}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get("/products", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      page,
      name: search || undefined, // will exclude 'search' if empty
    },
  });
  return response.data;
};

export const fetchProduct = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createProduct = async (payload: any) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.post("/products/create", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProduct = async (id: string, payload: any) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.put(`/products/update/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.delete(`/products/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
// Product APIs End

// Order APIs

export const fetchOrders = async ({ page = 1, search = "" } = {}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get("/k/orders", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      page,
      search: search || undefined, // will exclude 'search' if empty
    },
  });
  return response.data;
};

export const fetchOrder = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get(`/k/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};



export const deleteOrder = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.delete(`/k/orders/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// chaneg order status
export const changeOrderStatus = async (id: string, payload: any) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.put(`/k/orders/${id}/status`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// update order tracking details
export const updateOrderTracking = async (id: string, payload: {
  courier_name: string;
  tracking_number: string;
  tracking_url: string;
}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.put(`/k/orders/${id}/tracking`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// download order invoice
export const downloadOrderInvoice = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get(`/k/orders/${id}/invoice`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf, application/json'
    },
    responseType: 'blob'
  });
  
  // Check if response is actually a PDF
  const contentType = response.headers['content-type'];
  if (contentType && contentType.includes('application/json')) {
    // If it's JSON, it's probably an error message
    const text = await response.data.text();
    const error = JSON.parse(text);
    throw new Error(error.message || 'Failed to generate invoice');
  }
  
  return response.data;
};

// update order items packing status
export const updateOrderItemsPacking = async (orderId: string, payload: {
  items: Array<{
    order_item_id: number;
    stock_status: 'available' | 'partial' | 'unavailable';
    packed_quantity: number;
    admin_note?: string;
  }>;
}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.post(`/k/orders/${orderId}/items/update-packing`, payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};


// Schedule/Report APIs
export const fetchScheduleList = async ({ page = 1, type = "", command = "" } = {}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get("/k/schedule/list", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      page,
      type: type || undefined,
      command: command || undefined,
    },
  });
  return response.data;
};

export const createScheduleRequest = async (payload: {
  command: string;
  type: string;
  arguments?: any[];
}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.post("/k/schedule/create", payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Order APIs End

// Coupon APIs

export const fetchCoupons = async ({ page = 1, search = "" } = {}) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get("/k/coupons", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      page,
      search: search || undefined, // will exclude 'search' if empty
    },
  });
  return response.data;
};

export const fetchCoupon = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.get(`/k/coupons/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
export const createCoupon = async (payload: any) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.post("/k/coupons/create", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateCoupon = async (id: string, payload: any) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.put(`/k/coupons/update/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};  

export const deleteCoupon = async (id: string) => {
  const token = JSON.parse(localStorage.getItem("duser") || "{}")?.access_token || "";
  const response = await api.delete(`/k/coupons/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Coupon APIs End

