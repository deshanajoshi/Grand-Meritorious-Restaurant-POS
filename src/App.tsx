import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Armchair,
  ChefHat,
  UtensilsCrossed,
  BarChart3,
  Users,
} from "lucide-react";
import { useStore } from "./lib/store";
import AppLayout, { type NavItem } from "./components/AppLayout";
import Login from "./pages/Login";
import WaiterDashboard from "./pages/waiter/WaiterDashboard";
import Tables from "./pages/waiter/Tables";
import OrderScreen from "./pages/waiter/OrderScreen";
import Orders from "./pages/waiter/Orders";
import Bill from "./pages/waiter/Bill";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MenuManager from "./pages/admin/MenuManager";
import TableManager from "./pages/admin/TableManager";
import WaiterManager from "./pages/admin/WaiterManager";
import Reports from "./pages/admin/Reports";
import type { ReactNode } from "react";
import type { Role } from "./lib/types";

const ico = (I: typeof LayoutDashboard) => <I className="h-5 w-5" />;

const waiterNav: NavItem[] = [
  { to: "/waiter", label: "Dashboard", icon: ico(LayoutDashboard) },
  { to: "/waiter/tables", label: "Tables", icon: ico(Armchair) },
  { to: "/waiter/orders", label: "Orders", icon: ico(ChefHat) },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: ico(LayoutDashboard) },
  { to: "/admin/menu", label: "Menu", icon: ico(UtensilsCrossed) },
  { to: "/admin/tables", label: "Tables", icon: ico(Armchair) },
  { to: "/admin/waiters", label: "Waiters", icon: ico(Users) },
  { to: "/admin/reports", label: "Reports", icon: ico(BarChart3) },
];

function Guard({ role, children }: { role: Role; children: ReactNode }) {
  const user = useStore((s) => s.currentUser);
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role)
    return <Navigate to={user.role === "admin" ? "/admin" : "/waiter"} replace />;
  return <>{children}</>;
}

function Root() {
  const user = useStore((s) => s.currentUser);
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/waiter"} replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />

        {/* Waiter */}
        <Route
          path="/waiter"
          element={
            <Guard role="waiter">
              <AppLayout nav={waiterNav}>
                <WaiterDashboard />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/waiter/tables"
          element={
            <Guard role="waiter">
              <AppLayout nav={waiterNav}>
                <Tables />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/waiter/order"
          element={
            <Guard role="waiter">
              <AppLayout nav={waiterNav}>
                <OrderScreen />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/waiter/orders"
          element={
            <Guard role="waiter">
              <AppLayout nav={waiterNav}>
                <Orders />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/waiter/bill/:id"
          element={
            <Guard role="waiter">
              <AppLayout nav={waiterNav}>
                <Bill />
              </AppLayout>
            </Guard>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <Guard role="admin">
              <AppLayout nav={adminNav}>
                <AdminDashboard />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <Guard role="admin">
              <AppLayout nav={adminNav}>
                <MenuManager />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <Guard role="admin">
              <AppLayout nav={adminNav}>
                <TableManager />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/admin/waiters"
          element={
            <Guard role="admin">
              <AppLayout nav={adminNav}>
                <WaiterManager />
              </AppLayout>
            </Guard>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <Guard role="admin">
              <AppLayout nav={adminNav}>
                <Reports />
              </AppLayout>
            </Guard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
