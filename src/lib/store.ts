import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppNotification,
  Category,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  RestaurantTable,
  TableStatus,
  User,
  VegType,
} from "./types";
import {
  RESTAURANT,
  SEED_CATEGORIES,
  SEED_MENU,
  SEED_TABLES,
  SEED_USERS,
} from "./seed";

const uid = () => Math.random().toString(36).slice(2, 10);

function seedHistory(): Order[] {
  // Generate completed orders over the past ~30 days for analytics
  const orders: Order[] = [];
  const now = Date.now();
  const day = 86400000;
  const menu = SEED_MENU;
  const waiters = SEED_USERS.filter((u) => u.role === "waiter");
  let counter = 0;
  for (let d = 30; d >= 0; d--) {
    const ordersToday = 4 + Math.floor(Math.random() * 9);
    for (let k = 0; k < ordersToday; k++) {
      const numItems = 2 + Math.floor(Math.random() * 4);
      const items: OrderItem[] = [];
      for (let i = 0; i < numItems; i++) {
        const m = menu[Math.floor(Math.random() * menu.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        items.push({
          itemId: m.id,
          name: m.name,
          price: m.price,
          qty,
          veg: m.veg,
        });
      }
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const gst = Math.round(subtotal * RESTAURANT.gstRate);
      const serviceCharge =
        Math.random() > 0.5 ? Math.round(subtotal * RESTAURANT.serviceChargeRate) : 0;
      const discount = Math.random() > 0.8 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal + gst + serviceCharge - discount;
      const w = waiters[Math.floor(Math.random() * waiters.length)];
      const ts = now - d * day - Math.floor(Math.random() * day);
      const methods: PaymentMethod[] = ["cash", "upi", "card"];
      orders.push({
        id: `H${(++counter).toString().padStart(4, "0")}`,
        tableNumber: 1 + Math.floor(Math.random() * 16),
        waiterId: w.id,
        waiterName: w.name,
        items,
        status: "completed",
        subtotal,
        gst,
        serviceCharge,
        discount,
        total,
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        paid: true,
        createdAt: ts,
        updatedAt: ts,
        completedAt: ts,
      });
    }
  }
  return orders;
}

interface DraftItem extends OrderItem {}

interface AppState {
  // auth
  currentUser: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;

  // data
  users: User[];
  menu: MenuItem[];
  categories: Category[];
  tables: RestaurantTable[];
  orders: Order[];
  notifications: AppNotification[];

  // order draft (per active table flow)
  draftTable: number | null;
  draftItems: DraftItem[];
  draftInstructions: string;
  draftServiceCharge: boolean;

  // draft actions
  startOrder: (tableNumber: number) => void;
  cancelDraft: () => void;
  addToDraft: (item: MenuItem) => void;
  setDraftQty: (itemId: string, qty: number) => void;
  setItemNotes: (itemId: string, notes: string) => void;
  setDraftInstructions: (text: string) => void;
  toggleServiceCharge: () => void;
  submitDraft: () => Order | null;

  // order actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  payOrder: (
    orderId: string,
    method: PaymentMethod,
    discount: number,
  ) => void;

  // table actions
  setTableStatus: (tableId: string, status: TableStatus) => void;
  addTable: (capacity: number) => void;
  updateTable: (id: string, patch: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;

  // menu admin
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (name: string, icon: string) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // waiter admin
  addWaiter: (w: Omit<User, "id" | "role">) => void;
  updateWaiter: (id: string, patch: Partial<User>) => void;
  deleteWaiter: (id: string) => void;
  resetPassword: (id: string, password: string) => void;

  // notifications
  markNotificationsRead: () => void;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;

  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: SEED_USERS,
      menu: SEED_MENU,
      categories: SEED_CATEGORIES,
      tables: SEED_TABLES,
      orders: seedHistory(),
      notifications: [],

      draftTable: null,
      draftItems: [],
      draftInstructions: "",
      draftServiceCharge: false,

      login: (username, password) => {
        const u = get().users.find(
          (x) =>
            x.username.toLowerCase() === username.toLowerCase().trim() &&
            x.password === password &&
            x.active,
        );
        if (u) set({ currentUser: u });
        return u ?? null;
      },
      logout: () => set({ currentUser: null, draftTable: null, draftItems: [] }),

      startOrder: (tableNumber) => {
        // load existing pending order for this table if present
        const existing = get().orders.find(
          (o) =>
            o.tableNumber === tableNumber &&
            !["completed"].includes(o.status) &&
            !o.paid,
        );
        if (existing) {
          set({
            draftTable: tableNumber,
            draftItems: existing.items.map((i) => ({ ...i })),
            draftInstructions: existing.specialInstructions ?? "",
            draftServiceCharge: existing.serviceCharge > 0,
          });
        } else {
          set({
            draftTable: tableNumber,
            draftItems: [],
            draftInstructions: "",
            draftServiceCharge: false,
          });
        }
      },
      cancelDraft: () =>
        set({ draftTable: null, draftItems: [], draftInstructions: "" }),

      addToDraft: (item) => {
        const items = [...get().draftItems];
        const idx = items.findIndex((i) => i.itemId === item.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
        } else {
          items.push({
            itemId: item.id,
            name: item.name,
            price: item.price,
            qty: 1,
            veg: item.veg,
          });
        }
        set({ draftItems: items });
      },
      setDraftQty: (itemId, qty) => {
        let items = [...get().draftItems];
        if (qty <= 0) {
          items = items.filter((i) => i.itemId !== itemId);
        } else {
          items = items.map((i) => (i.itemId === itemId ? { ...i, qty } : i));
        }
        set({ draftItems: items });
      },
      setItemNotes: (itemId, notes) => {
        set({
          draftItems: get().draftItems.map((i) =>
            i.itemId === itemId ? { ...i, notes } : i,
          ),
        });
      },
      setDraftInstructions: (text) => set({ draftInstructions: text }),
      toggleServiceCharge: () =>
        set({ draftServiceCharge: !get().draftServiceCharge }),

      submitDraft: () => {
        const s = get();
        if (!s.draftTable || s.draftItems.length === 0 || !s.currentUser)
          return null;
        const subtotal = s.draftItems.reduce(
          (sum, it) => sum + it.price * it.qty,
          0,
        );
        const gst = Math.round(subtotal * RESTAURANT.gstRate);
        const serviceCharge = s.draftServiceCharge
          ? Math.round(subtotal * RESTAURANT.serviceChargeRate)
          : 0;
        const total = subtotal + gst + serviceCharge;

        // update popularity
        const menu = s.menu.map((m) => {
          const ordered = s.draftItems.find((d) => d.itemId === m.id);
          return ordered
            ? { ...m, popular: (m.popular ?? 0) + ordered.qty }
            : m;
        });

        // is there an existing open order for table? update it; else create
        const existing = s.orders.find(
          (o) => o.tableNumber === s.draftTable && !o.paid && o.status !== "completed",
        );
        let order: Order;
        let orders: Order[];
        if (existing) {
          order = {
            ...existing,
            items: s.draftItems.map((i) => ({ ...i })),
            specialInstructions: s.draftInstructions,
            subtotal,
            gst,
            serviceCharge,
            total: total - existing.discount,
            status: existing.status === "completed" ? "pending" : existing.status,
            updatedAt: Date.now(),
          };
          orders = s.orders.map((o) => (o.id === existing.id ? order : o));
        } else {
          order = {
            id: `ORD-${uid().toUpperCase()}`,
            tableNumber: s.draftTable,
            waiterId: s.currentUser.id,
            waiterName: s.currentUser.name,
            items: s.draftItems.map((i) => ({ ...i })),
            status: "pending",
            specialInstructions: s.draftInstructions,
            subtotal,
            gst,
            serviceCharge,
            discount: 0,
            total,
            paid: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          orders = [order, ...s.orders];
        }

        const tables = s.tables.map((t) =>
          t.number === s.draftTable
            ? { ...t, status: "occupied" as TableStatus, currentOrderId: order.id }
            : t,
        );

        const notif: AppNotification = {
          id: uid(),
          type: "new_order",
          message: `New order for Table ${s.draftTable} · ₹${total}`,
          read: false,
          createdAt: Date.now(),
        };

        set({
          orders,
          tables,
          menu,
          notifications: [notif, ...s.notifications].slice(0, 50),
          draftTable: null,
          draftItems: [],
          draftInstructions: "",
          draftServiceCharge: false,
        });
        return order;
      },

      updateOrderStatus: (orderId, status) => {
        const s = get();
        const orders = s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                updatedAt: Date.now(),
                completedAt: status === "completed" ? Date.now() : o.completedAt,
              }
            : o,
        );
        let notifications = s.notifications;
        const ord = s.orders.find((o) => o.id === orderId);
        if (status === "ready" && ord) {
          notifications = [
            {
              id: uid(),
              type: "order_ready" as const,
              message: `Table ${ord.tableNumber} order is ready to serve!`,
              read: false,
              createdAt: Date.now(),
            },
            ...notifications,
          ].slice(0, 50);
        }
        set({ orders, notifications });
      },

      payOrder: (orderId, method, discount) => {
        const s = get();
        const ord = s.orders.find((o) => o.id === orderId);
        if (!ord) return;
        const total = ord.subtotal + ord.gst + ord.serviceCharge - discount;
        const orders = s.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                paid: true,
                paymentMethod: method,
                discount,
                total,
                status: "completed" as OrderStatus,
                completedAt: Date.now(),
                updatedAt: Date.now(),
              }
            : o,
        );
        const tables = s.tables.map((t) =>
          t.number === ord.tableNumber
            ? { ...t, status: "available" as TableStatus, currentOrderId: null }
            : t,
        );
        const notif: AppNotification = {
          id: uid(),
          type: "bill_generated",
          message: `Bill generated · Table ${ord.tableNumber} · ₹${total}`,
          read: false,
          createdAt: Date.now(),
        };
        set({ orders, tables, notifications: [notif, ...s.notifications].slice(0, 50) });
      },

      setTableStatus: (tableId, status) =>
        set({
          tables: get().tables.map((t) =>
            t.id === tableId ? { ...t, status } : t,
          ),
        }),
      addTable: (capacity) => {
        const tables = get().tables;
        const maxNum = tables.reduce((m, t) => Math.max(m, t.number), 0);
        set({
          tables: [
            ...tables,
            {
              id: `table-${uid()}`,
              number: maxNum + 1,
              capacity,
              status: "available",
              currentOrderId: null,
            },
          ],
        });
      },
      updateTable: (id, patch) =>
        set({
          tables: get().tables.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
      deleteTable: (id) =>
        set({ tables: get().tables.filter((t) => t.id !== id) }),

      addMenuItem: (item) =>
        set({ menu: [{ ...item, id: `item-${uid()}` }, ...get().menu] }),
      updateMenuItem: (id, patch) =>
        set({
          menu: get().menu.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }),
      deleteMenuItem: (id) =>
        set({ menu: get().menu.filter((m) => m.id !== id) }),
      addCategory: (name, icon) =>
        set({
          categories: [
            ...get().categories,
            { id: `cat-${uid()}`, name, icon },
          ],
        }),
      updateCategory: (id, patch) =>
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }),
      deleteCategory: (id) =>
        set({ categories: get().categories.filter((c) => c.id !== id) }),

      addWaiter: (w) =>
        set({
          users: [...get().users, { ...w, id: `u-${uid()}`, role: "waiter" }],
        }),
      updateWaiter: (id, patch) =>
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        }),
      deleteWaiter: (id) =>
        set({ users: get().users.filter((u) => u.id !== id) }),
      resetPassword: (id, password) =>
        set({
          users: get().users.map((u) =>
            u.id === id ? { ...u, password } : u,
          ),
        }),

      markNotificationsRead: () =>
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        }),
      pushNotification: (n) =>
        set({
          notifications: [
            { ...n, id: uid(), read: false, createdAt: Date.now() },
            ...get().notifications,
          ].slice(0, 50),
        }),

      resetAll: () => {
        set({
          users: SEED_USERS,
          menu: SEED_MENU,
          categories: SEED_CATEGORIES,
          tables: SEED_TABLES,
          orders: seedHistory(),
          notifications: [],
          draftTable: null,
          draftItems: [],
          draftInstructions: "",
        });
      },
    }),
    {
      name: "grand-meritorious-pos-v2-veg",
      partialize: (s) => ({
        currentUser: s.currentUser,
        users: s.users,
        menu: s.menu,
        categories: s.categories,
        tables: s.tables,
        orders: s.orders,
        notifications: s.notifications,
      }),
    },
  ),
);

export type { VegType };
