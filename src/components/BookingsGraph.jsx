import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from "recharts";

export const BookingsGraphSkeleton = () => (
   <div className="bg-white p-4 rounded-xl shadow-sm border animate-pulse">
    <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
    <div className="h-48 bg-gray-200 rounded"></div>
  </div>
);

const BookingsGraph = ({ data }) => {
  const formatted = data?.map((item) => ({
    date: item._id,
    count: item.count
  })) || [];

//   console.log(formatted)

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Bookings - Last 30 Days
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#dc2626"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsGraph;
