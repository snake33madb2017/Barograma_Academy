"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, AlertCircle, TrendingUp, Search, Bell, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchApi } from '../../lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const sendReminder = async (employeeId: string) => {
    try {
      await fetchApi(`/notifications/remind/${employeeId}`, { method: 'POST' });
      alert('¡Recordatorio Push enviado con éxito!');
    } catch (e) {
      alert('Error al enviar el recordatorio. ¿Tiene el usuario notificaciones activadas?');
      console.error(e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (!u.id || (u.role !== 'ADMIN' && u.role !== 'SUPERADMIN')) {
          router.push('/login');
          return;
        }
        setUser(u);
        const data = await fetchApi(`/companies/${u.companyId}/kpis`);
        setKpis(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>;
  if (!kpis) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Error al cargar datos.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Admin Header */}
      <header className="bg-black text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Barograma" className="h-8 object-contain" />
          <h1 className="text-2xl font-bold hidden sm:block" style={{ color: '#D4BC6F' }}>Panel B2B</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold hidden md:block">Hola, {user?.name}</span>
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2" style={{ borderColor: '#D4BC6F' }}>
            <span className="text-sm font-bold">AD</span>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-red-400 hover:text-red-300 ml-2" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Personal Activo</p>
              <h3 className="text-2xl font-bold">{kpis.activeStaff}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Cursos Completados</p>
              <h3 className="text-2xl font-bold">{kpis.completedCourses}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Nota Media</p>
              <h3 className="text-2xl font-bold">{kpis.averageScore}/100</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Alertas (Inactivos)</p>
              <h3 className="text-2xl font-bold">{kpis.alerts}</h3>
            </div>
          </div>
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Actividad de Capacitación (Últimos 7 días)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="finalizados" stroke="#D4BC6F" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Acciones Recomendadas</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">Probar notificación (enviártela a ti mismo para testear):</p>
                <button onClick={() => sendReminder(user?.id)} className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors">
                  Enviar Recordatorio Push
                </button>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-2">María completó "Gestión de quejas".</p>
                <button className="text-xs font-bold text-white bg-green-600 px-3 py-1 rounded">Descargar Certificado</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
