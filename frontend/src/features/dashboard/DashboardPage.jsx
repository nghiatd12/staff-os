import StatCard from './components/StatCard'
import RevenueChart from './components/RevenueChart'
import TopDishes from './components/TopDishes'
import RecentOrders from './components/RecentOrders'

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 fade-in overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tổng quan</h1>
          <p className="text-slate-400 text-sm mt-1">Dữ liệu hoạt động hôm nay — Chủ nhật, 08/05/2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-xl text-xs font-medium text-brand-700">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Realtime
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Doanh thu hôm nay"
          value="2.450.000đ"
          trend="+12%"
          trendUp={true}
          icon="💰"
          iconBg="bg-brand-50"
        />
        <StatCard
          label="Bàn đang phục vụ"
          value="8/15"
          trend="53% công suất"
          trendUp={null}
          icon="🪑"
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Đơn hàng hôm nay"
          value="47"
          trend="+8 đơn"
          trendUp={true}
          icon="📋"
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Nhân viên ca này"
          value="6"
          trend="2 nghỉ hôm nay"
          trendUp={false}
          icon="👥"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <TopDishes />
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  )
}
