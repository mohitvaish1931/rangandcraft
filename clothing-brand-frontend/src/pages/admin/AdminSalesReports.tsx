import { BarChart, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const AdminSalesReports = () => {
  const stats = [
    { label: 'Total Revenue', value: '₹14,50,000', icon: <DollarSign className="w-5 h-5" />, growth: '+15%' },
    { label: 'Orders This Month', value: '450', icon: <BarChart className="w-5 h-5" />, growth: '+8%' },
    { label: 'Average Order Value', value: '₹3,222', icon: <TrendingUp className="w-5 h-5" />, growth: '+2%' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
          <Calendar className="w-4 h-4" />
          Last 30 Days
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 border border-gray-100 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-teal-50 text-[#295454] rounded-lg">{stat.icon}</div>
              <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">{stat.growth}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-100 rounded-xl p-6 h-80 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Detailed sales chart will populate as more data arrives.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSalesReports;
