import type { Category, MenuItem, RestaurantTable, User } from "./types";

export const SEED_CATEGORIES: Category[] = [
  { id: "starters", name: "Starters", icon: "🍢" },
  { id: "soup", name: "Soup", icon: "🍜" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "burger", name: "Burger", icon: "🍔" },
  { id: "sandwich", name: "Sandwich", icon: "🥪" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
  { id: "chinese", name: "Chinese", icon: "🥡" },
  { id: "southindian", name: "South Indian", icon: "🥘" },
  { id: "punjabi", name: "Punjabi", icon: "🍛" },
  { id: "gujarati", name: "Gujarati", icon: "🪔" },
  { id: "rice", name: "Rice", icon: "🍚" },
  { id: "breads", name: "Breads", icon: "🫓" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "icecream", name: "Ice Cream", icon: "🍨" },
  { id: "special", name: "Special Items", icon: "⭐" },
];

const IMG = {
  paneer: "/food/paneer-tikka.jpg",
  soup: "/food/tomato-soup.jpg",
  pizza: "/food/pizza.jpg",
  burger: "/food/burger.jpg",
  sandwich: "/food/sandwich.jpg",
  pasta: "/food/pasta.jpg",
  noodles: "/food/noodles.jpg",
  dosa: "/food/dosa.jpg",
  butter: "/food/butter-chicken.jpg",
  thali: "/food/thali.jpg",
  biryani: "/food/biryani.jpg",
  naan: "/food/naan.jpg",
  lassi: "/food/lassi.jpg",
  cake: "/food/lava-cake.jpg",
  icecream: "/food/ice-cream.jpg",
};

let n = 0;
const mk = (
  name: string,
  description: string,
  price: number,
  category: string,
  veg: "veg" | "nonveg",
  image: string,
  available = true,
  popular = 0,
): MenuItem => ({
  id: `item-${++n}`,
  name,
  description,
  price,
  category,
  veg,
  available,
  image,
  popular,
});

// Pure Vegetarian menu — Grand Meritorious is a 100% vegetarian restaurant.
export const SEED_MENU: MenuItem[] = [
  // Starters
  mk("Paneer Tikka", "Cottage cheese marinated in spiced yogurt, char-grilled in tandoor.", 320, "starters", "veg", IMG.paneer, true, 42),
  mk("Hara Bhara Kebab", "Spinach, peas and potato patties, crisp outside and soft within.", 280, "starters", "veg", IMG.paneer, true, 30),
  mk("Veg Spring Roll", "Crispy rolls filled with sautéed vegetables, served with chilli sauce.", 240, "starters", "veg", IMG.noodles, true, 21),
  mk("Crispy Corn", "Golden fried corn kernels tossed with bell peppers and herbs.", 260, "starters", "veg", IMG.paneer, true, 15),
  // Soup
  mk("Cream of Tomato Soup", "Velvety tomato soup finished with fresh basil and cream.", 160, "soup", "veg", IMG.soup, true, 28),
  mk("Hot & Sour Soup", "Tangy and spicy soup loaded with vegetables.", 170, "soup", "veg", IMG.soup, true, 19),
  mk("Sweet Corn Soup", "Comforting soup with crunchy corn and garden vegetables.", 160, "soup", "veg", IMG.soup, true, 24),
  // Pizza
  mk("Margherita Pizza", "Classic pizza with mozzarella, tomato and fresh basil.", 360, "pizza", "veg", IMG.pizza, true, 51),
  mk("Farmhouse Pizza", "Loaded with onion, capsicum, mushroom and corn.", 420, "pizza", "veg", IMG.pizza, true, 33),
  mk("Paneer Makhani Pizza", "Tandoori paneer, onions and a creamy makhani base.", 460, "pizza", "veg", IMG.pizza, true, 36),
  // Burger
  mk("Classic Veg Burger", "Crunchy veg patty, lettuce, cheese and house sauce.", 180, "burger", "veg", IMG.burger, true, 27),
  mk("Paneer Burger", "Spiced paneer patty with caramelised onions.", 240, "burger", "veg", IMG.burger, true, 31),
  mk("Double Cheese Burger", "Double veg patty, double cheese, smoky barbecue glaze.", 290, "burger", "veg", IMG.burger, false, 18),
  // Sandwich
  mk("Bombay Grilled Sandwich", "Spiced potato, chutney and veggies grilled with butter.", 150, "sandwich", "veg", IMG.sandwich, true, 22),
  mk("Veg Club Sandwich", "Triple-decker with veggies, cheese and house spreads.", 220, "sandwich", "veg", IMG.sandwich, true, 17),
  // Pasta
  mk("Penne Alfredo", "Creamy white sauce pasta with herbs and parmesan.", 320, "pasta", "veg", IMG.pasta, true, 29),
  mk("Arrabbiata Pasta", "Spicy tomato sauce pasta with garlic and chilli.", 300, "pasta", "veg", IMG.pasta, true, 20),
  mk("Pesto Veg Pasta", "Penne tossed in basil pesto with seasonal vegetables.", 340, "pasta", "veg", IMG.pasta, true, 23),
  // Chinese
  mk("Veg Hakka Noodles", "Wok-tossed noodles with crunchy vegetables.", 260, "chinese", "veg", IMG.noodles, true, 34),
  mk("Chilli Paneer", "Paneer cubes tossed in spicy Indo-Chinese sauce.", 320, "chinese", "veg", IMG.noodles, true, 30),
  mk("Veg Fried Rice", "Classic fried rice with garden-fresh vegetables.", 260, "chinese", "veg", IMG.biryani, true, 26),
  // South Indian
  mk("Masala Dosa", "Crispy dosa filled with spiced potato, served with sambar.", 180, "southindian", "veg", IMG.dosa, true, 47),
  mk("Idli Sambar", "Steamed rice cakes with lentil sambar and chutney.", 140, "southindian", "veg", IMG.dosa, true, 25),
  mk("Mysore Masala Dosa", "Spicy red chutney dosa with potato filling.", 200, "southindian", "veg", IMG.dosa, true, 19),
  // Punjabi
  mk("Shahi Paneer", "Cottage cheese in a royal cashew and tomato gravy.", 380, "punjabi", "veg", IMG.butter, true, 50),
  mk("Paneer Butter Masala", "Cottage cheese in a luscious creamy tomato gravy.", 360, "punjabi", "veg", IMG.butter, true, 44),
  mk("Dal Makhani", "Slow-cooked black lentils with butter and cream.", 280, "punjabi", "veg", IMG.butter, true, 39),
  // Gujarati
  mk("Gujarati Thali", "Wholesome platter of rotli, sabzi, dal, rice and sweet.", 320, "gujarati", "veg", IMG.thali, true, 41),
  mk("Undhiyu", "Traditional mixed vegetable casserole with spices.", 260, "gujarati", "veg", IMG.thali, true, 16),
  // Rice
  mk("Hyderabadi Veg Biryani", "Fragrant basmati rice layered with spiced vegetables.", 280, "rice", "veg", IMG.biryani, true, 35),
  mk("Paneer Biryani", "Aromatic biryani with marinated paneer and saffron.", 320, "rice", "veg", IMG.biryani, true, 49),
  mk("Jeera Rice", "Basmati rice tempered with cumin.", 160, "rice", "veg", IMG.biryani, true, 14),
  // Breads
  mk("Butter Naan", "Soft tandoori bread brushed with butter.", 60, "breads", "veg", IMG.naan, true, 62),
  mk("Garlic Naan", "Naan topped with garlic and coriander.", 80, "breads", "veg", IMG.naan, true, 45),
  mk("Tandoori Roti", "Whole-wheat bread from the tandoor.", 40, "breads", "veg", IMG.naan, true, 33),
  // Beverages
  mk("Sweet Lassi", "Chilled yogurt drink, sweet and frothy.", 120, "beverages", "veg", IMG.lassi, true, 38),
  mk("Mango Lassi", "Creamy lassi blended with ripe mango.", 140, "beverages", "veg", IMG.lassi, true, 40),
  mk("Masala Chai", "Spiced Indian tea brewed with milk.", 60, "beverages", "veg", IMG.lassi, true, 29),
  mk("Fresh Lime Soda", "Refreshing lime soda, sweet or salted.", 90, "beverages", "veg", IMG.lassi, true, 22),
  // Desserts
  mk("Chocolate Lava Cake", "Warm chocolate cake with a molten centre.", 220, "desserts", "veg", IMG.cake, true, 36),
  mk("Gulab Jamun", "Soft milk dumplings soaked in saffron syrup.", 140, "desserts", "veg", IMG.cake, true, 41),
  // Ice Cream
  mk("Vanilla Sundae", "Classic vanilla with chocolate sauce and nuts.", 160, "icecream", "veg", IMG.icecream, true, 24),
  mk("Kulfi Falooda", "Traditional kulfi with vermicelli and rose syrup.", 180, "icecream", "veg", IMG.icecream, true, 27),
  // Special
  mk("Grand Meritorious Platter", "Chef's signature assortment of vegetarian starters for the table.", 650, "special", "veg", IMG.thali, true, 33),
  mk("Royal Veg Feast", "A curated vegetarian course celebrating the house specials.", 580, "special", "veg", IMG.thali, true, 28),
];

export const SEED_TABLES: RestaurantTable[] = Array.from({ length: 16 }).map(
  (_, i) => ({
    id: `table-${i + 1}`,
    number: i + 1,
    capacity: i % 4 === 0 ? 6 : i % 3 === 0 ? 8 : 4,
    status: "available",
    currentOrderId: null,
  }),
);

export const SEED_USERS: User[] = [
  {
    id: "u-admin",
    name: "Rajan Mehta",
    username: "admin",
    password: "admin123",
    role: "admin",
    phone: "+91 98250 11111",
    active: true,
  },
  {
    id: "u-w1",
    name: "Arjun Sharma",
    username: "arjun",
    password: "waiter123",
    role: "waiter",
    phone: "+91 98250 22222",
    active: true,
    shift: "Morning",
  },
  {
    id: "u-w2",
    name: "Priya Patel",
    username: "priya",
    password: "waiter123",
    role: "waiter",
    phone: "+91 98250 33333",
    active: true,
    shift: "Evening",
  },
  {
    id: "u-w3",
    name: "Vikram Singh",
    username: "vikram",
    password: "waiter123",
    role: "waiter",
    phone: "+91 98250 44444",
    active: true,
    shift: "Evening",
  },
];

// Restaurant config
export const RESTAURANT = {
  name: "Grand Meritorious",
  tagline: "Pure Veg Fine Dining · Est. 1998",
  address: "12 Heritage Avenue, Ahmedabad, Gujarat 380009",
  phone: "+91 79 4000 1234",
  gstin: "24ABCDE1234F1Z5",
  fssai: "10024031000123",
  gstRate: 0.05, // 5% GST
  serviceChargeRate: 0.1, // 10% service charge (optional)
};
