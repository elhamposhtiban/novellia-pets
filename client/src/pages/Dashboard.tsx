import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { DashboardStats } from "../types";
import Loading from "../components/Loading";
import Error from "../components/Error";
import NavLink from "../components/NavLink";

function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get<DashboardStats>("/dashboard/stats");
      return response.data;
    },
  });

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Error
        message="Error loading dashboard"
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Novellia Pets Dashboard</h1>
          <NavLink to="/pets" variant="button">
            View All Pets
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm font-medium">Total Pets</h2>
            <p className="text-3xl font-bold mt-2">{data?.totalPets || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm font-medium">Total Records</h2>
            <p className="text-3xl font-bold mt-2">{data?.totalRecords || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pets by Type</h2>
          <div className="space-y-2">
            {data?.petsByType &&
              Object.entries(data.petsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
