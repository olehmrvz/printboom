"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  instagramNick: string;
  status: "NEW" | "PRINTING" | "DONE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Нове",
  PRINTING: "В друці",
  DONE: "Готове",
  CANCELLED: "Скасоване",
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "Нове" },
  { value: "PRINTING", label: "В друці" },
  { value: "DONE", label: "Готове" },
  { value: "CANCELLED", label: "Скасоване" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Видалити замовлення?")) return;
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  const filtered = orders
    .filter((o) => (filter === "ALL" ? true : o.status === filter))
    .filter((o) => o.instagramNick.toLowerCase().includes(search.toLowerCase()));

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Замовлення</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Всього: {orders.length}</p>
          </div>
          <a
            href="/admin/dashboard"
            className="px-4 py-2 bg-neutral-800/60 border border-neutral-700/30 rounded-xl text-[12px] font-medium hover:bg-neutral-700/60 transition-all w-fit"
          >
            ← Dashboard
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по ніку..."
            className="flex-1 bg-neutral-800/50 text-white text-[13px] px-4 py-2.5 rounded-xl outline-none border border-neutral-700/40 focus:border-white/25 placeholder:text-neutral-600"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[{ value: "ALL", label: "Всі" }, ...STATUS_OPTIONS].map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all border ${
                  filter === s.value
                    ? "bg-white text-black border-white"
                    : "bg-neutral-800/40 text-neutral-400 border-neutral-700/30 hover:bg-neutral-800/70"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111114] border border-neutral-800 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-[13px]">Нічого не знайдено</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Instagram</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Статус</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Дата</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {filtered.map((o, idx) => (
                    <tr key={o.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-4 py-3 text-[12px] text-neutral-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 text-[13px] font-medium">@{o.instagramNick}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="bg-neutral-800/60 text-white text-[11px] px-2 py-1.5 rounded-lg border border-neutral-700/30 outline-none cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-neutral-400">
                        {new Date(o.createdAt).toLocaleString("uk-UA", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteOrder(o.id)}
                          className="text-red-400/80 hover:text-red-300 text-[11px] font-medium transition-colors"
                        >
                          Видалити
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
