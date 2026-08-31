import { TrendingUp, AlertTriangle } from 'lucide-react';

const AdminProductReports = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Product Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-[#295454]" />
            <h3 className="font-bold text-lg">Top Performing Products</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-700">Premium Short Kurta - Navy</span>
              <span className="font-semibold">124 sold</span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-700">Royal Indo-Western Suit</span>
              <span className="font-semibold">89 sold</span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-700">Classic Silk Kurta Set</span>
              <span className="font-semibold">56 sold</span>
            </li>
          </ul>
        </div>

        <div className="border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-500" />
            <h3 className="font-bold text-lg">Low Inventory Alerts</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-700">Embroidered Sherwani (L)</span>
              <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">2 left</span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-700">Cotton Blend Kurta (M)</span>
              <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">5 left</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminProductReports;
