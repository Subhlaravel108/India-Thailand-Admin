import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Calendar,
  Map,
  FileText,
  Plus,
  Contact,
  Package,
} from "lucide-react";
import { fetchDashboardStats, fetchUserGraph,fetchBookingsGraph } from "@/lib/api";
import { Link } from "react-router-dom";
import UserGraph, { UserGraphSkeleton } from "@/components/UserGraph";
import BookingsGraph, { BookingsGraphSkeleton } from "@/components/BookingsGraph";
// ---- Stat Components ----

const StatCard = ({ title, value, description, icon, color, action }: any) => (
  <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-200">
    <div className={`absolute top-0 left-0 w-1 h-full ${color.replace('bg-', 'bg-')}`}></div>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      {action && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {action}
        </div>
      )}
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-8 w-8 bg-gray-200 rounded-lg" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-32 bg-gray-200 rounded" />
    </CardContent>
  </Card>
);

// ---- Dashboard Main Component ----

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [graphData, setGraphData] = useState<any>([]);
  const [graphLoading, setGraphLoading] = useState(true);
  const [bookingGraph, setBookingGraph] = useState([]);
const [loadingBookingGraph, setLoadingBookingGraph] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardStats();
        setStats(data.data);
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    const loadGraph = async () => {
      setGraphLoading(true);
      try {
        const res = await fetchUserGraph();
        setGraphData(res.data);
       console.log("user=",res.data)
      } catch (err) {
        setGraphData([]);
      } finally {
        setGraphLoading(false);
      }
    };

    const loadBookingGraph = async () => {
  setLoadingBookingGraph(true);
  try {
    const res = await fetchBookingsGraph();
    setBookingGraph(res.data);
 

  } catch (err) {
    setBookingGraph([]);
  } finally {
    setLoadingBookingGraph(false);
  }
};

    loadStats();
    loadGraph();
    loadBookingGraph()
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}! 👋</h1>
          <p className="text-gray-600 mt-1">
            Welcome to Jaipur-Thailand Tours Admin Dashboard
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
        <>
  <StatCard
    title="Total Users"
    value={stats?.totalUsers ?? "-"}
    description="Registered travelers"
    icon={<Users className="h-4 w-4 text-white" />}
    color="bg-gradient-to-br from-blue-500 to-blue-600"
  />

  <StatCard
    title="Blog Posts"
    value={stats?.totalBlogs ?? "-"}
    description="Travel articles"
    icon={<FileText className="h-4 w-4 text-white" />}
    color="bg-gradient-to-br from-purple-500 to-purple-600"
  />

  <StatCard
    title="Active Tours"
    value={stats?.activeTours ?? "-"}
    description="Running tours"
    icon={<Calendar className="h-4 w-4 text-white" />}
    color="bg-gradient-to-br from-orange-500 to-orange-600"
  />

  <StatCard
    title="Destinations"
    value={stats?.totalDestinations ?? "-"}
    description="Tour locations"
    icon={<Map className="h-4 w-4 text-white" />}
    color="bg-gradient-to-br from-teal-500 to-teal-600"
  />

  <StatCard
    title="Contacts"
    value={stats?.totalContacts ?? "-"}
    description="Total Contact Requests"
    icon={<Users className="h-4 w-4 text-white" />}   // Contact icon not available, using Users
    color="bg-gradient-to-br from-rose-500 to-rose-600"
  />

  <StatCard
    title="Total Packages"
    value={stats?.totalPackges ?? "-"}
    description="Available packages"
    icon={<Package className="h-4 w-4 text-white" />}
    color="bg-gradient-to-br from-green-500 to-green-600"
  />
</>

        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-2">
        {/* <div className=" space-y-6"> */}
          {graphLoading ? 
            <UserGraphSkeleton /> 
            : 
            <UserGraph data={graphData} />
          }
            {loadingBookingGraph ? (
    <BookingsGraphSkeleton />
  ) : (
    <BookingsGraph data={bookingGraph} />
  )}
        </div>

        <div className="space-y-6">
          {/* Future right-side widgets */}
        </div>
      </div>
    // </div>
  );
};

export default Dashboard;
