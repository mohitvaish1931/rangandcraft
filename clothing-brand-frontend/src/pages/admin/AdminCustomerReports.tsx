import { Users, UserPlus, Star } from 'lucide-react';

const AdminCustomerReports = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Customer Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-gray-100 rounded-xl p-6 text-center">
          <Users className="w-8 h-8 text-[#295454] mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Total Active Customers</p>
          <p className="text-3xl font-bold">1,245</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 text-center">
          <UserPlus className="w-8 h-8 text-[#295454] mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">New Signups This Month</p>
          <p className="text-3xl font-bold">128</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 text-center">
          <Star className="w-8 h-8 text-[#295454] mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Returning Customers</p>
          <p className="text-3xl font-bold">42%</p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Customer Demographics</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
           <p className="text-gray-500 font-medium">Demographic visualization available with more data.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerReports;
