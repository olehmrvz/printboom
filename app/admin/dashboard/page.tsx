"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Order {
  id: string;
  instagramNick: string;
  status: "NEW" | "PRINTING" | "DONE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  PRINTING: "#f59e0b",
  DONE: "#10b981",
  CANCELLED: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Нові",
  PRINTING: "В друці",
  DONE: "Готові",
  CANCELLED: "Скасовані",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const today = orders.filter((o) => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
    const printing = orders.filter((o) => o.status === "PRINTING").length;
    const done = orders.filter((o) => o.status === "DONE").length;
    return { total, today, printing, done };
  }, [orders]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);
  }, [orders]);

  const statusData = useMemo(() => {
    return ["NEW", "PRINTING", "DONE", "CANCELLED"].map((s) => ({
      name: STATUS_LABELS[s],
      value: orders.filter((o) => o.status === s).length,
      color: STATUS_COLORS[s],
    }));
  }, [orders]);

  const recent = useMemo(() => orders.slice(0, 10), [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="text-neutral-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Printboom Admin</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Dashboard</p>
          </div>
          <a
            href="/admin/orders"
            className="px-4 py-2 bg-neutral-800/60 border border-neutral-700/30 rounded-xl text-[12px] font-medium hover:bg-neutral-700/60 transition-all"
          >
            Всі замовлення →
          </a>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <KpiCard label="Всього" value={stats.total} color="text-white" />
          <KpiCard label="Сьогодні" value={stats.today} color="text-emerald-400" />
          <KpiCard label="В друці" value={stats.printing} color="text-amber-400" />
          <KpiCard label="Готові" value={stats.done} color="text-blue-400" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-[#111114] border border-neutral-800 rounded-2xl p-4 md:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-300 mb-4">Замовлення за днями</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1e", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "#ffffff05" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-[#111114] border border-neutral-800 rounded-2xl p-4 md:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-300 mb-4">За статусами</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1e", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#111114] border border-neutral-800 rounded-2xl p-4 md:p-5">
          <h3 className="text-[13px] font-semibold text-neutral-300 mb-4">Останні замовлення</h3>
          {recent.length === 0 ? (
            <div className="text-neutral-500 text-[13px]">Поки що немає замовлень</div>
          ) : (
            <div className="space-y-2">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/30 border border-neutral-800 hover:border-neutral-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: STATUS_COLORS[o.status] }} />
                    <div>
                      <div className="text-[13px] font-medium">@{o.instagramNick}</div>
                      <div className="text-[11px] text-neutral-500">{new Date(o.createdAt).toLocaleString("uk-UA")}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-neutral-800/60 text-neutral-300">
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#111114] border border-neutral-800 rounded-2xl p-4 md:p-5">
      <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
