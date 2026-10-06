import { useState, useEffect } from 'react';
import { 
  Users, Search, Mail, Phone, Calendar
} from 'lucide-react';
import { API_ENDPOINTS } from '../../utils/api';
import type { AdminUser } from '../../lib/adminTypes';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.USERS, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-xs text-gray-500 font-medium">{customers.length} Registered Users</p>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-600/20 w-80 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {customer.name?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{customer.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">ID: {customer._id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {customer.createdAt && new Date(customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      customer.isAdmin ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {customer.isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-gray-800">{customer.orderCount || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
