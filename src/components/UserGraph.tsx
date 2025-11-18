import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export const UserGraphSkeleton = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm border animate-pulse">
    <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
    <div className="h-48 bg-gray-200 rounded"></div>
  </div>
);

const UserGraph = ({ data }: any) => {
      const formatted = data?.map((item) => ({
    date: item._id,
    count: item.count
  })) || [];
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Last 7 Days New Users</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4F46E5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGraph;
