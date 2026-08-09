import {
  FaLinkedin,
  FaGithub,
  FaWhatsapp,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import { FiMail } from "react-icons/fi";
import {
  Home,
  Shield,
  User,
  Users,
  Building2,
  BarChart3,
  Truck,
  Phone,
  Info,
  LogOut,
  LogIn,
  UserPlus,
  Eye,
  Grid,
  Lock,
  FileText,
  CreditCard,
  HelpCircle,
  LucideIcon,
  ShoppingCart,
  Package,
  Settings,
  Stethoscope,
  Activity,
} from "lucide-react";

export interface NavItem {
  path: string;
  name: string;
  icon: LucideIcon;
}

export interface AppModule {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  links: NavItem[];
}

export const APPS_MODULES: AppModule[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: BarChart3,
    color: "from-blue-500/20 to-blue-500/5",
    links: [
      { path: "/", name: "Home", icon: Home },
      { path: "/dashboard", name: "Overview", icon: BarChart3 },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    icon: ShoppingCart,
    color: "from-green-500/20 to-green-500/5",
    links: [
      { path: "/dashboard/invoices", name: "Invoices", icon: FileText },
      { path: "/dashboard/payments", name: "Payments", icon: CreditCard },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    icon: Users,
    color: "from-purple-500/20 to-purple-500/5",
    links: [
      { path: "/users", name: "Customers", icon: Users },
      // { path: "/crm", name: "CRM Overview", icon: BarChart3 },
    ],
  },
  {
    id: "medical",
    name: "Medical",
    icon: Stethoscope,
    color: "from-teal-500/20 to-teal-500/5",
    links: [
      // { path: "/prescriptions", name: "Prescriptions", icon: Eye },
    ],
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: Package,
    color: "from-orange-500/20 to-orange-500/5",
    links: [
      // { path: "/products/supplier", name: "Suppliers", icon: Truck },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    color: "from-gray-500/20 to-gray-500/5",
    links: [
      { path: "/profile", name: "Profile", icon: User },
      { path: "/admin", name: "Admin", icon: Shield },
      // { path: "/tenants", name: "Tenants", icon: Building2 },
    ],
  },
];

// Fallback for flat mapping if needed anywhere else
export const URLDATA: NavItem[] = APPS_MODULES.flatMap((app) => app.links);

export const navUrl: NavItem[] = [
  { "path": "/", "name": "Home", icon: Home },
  { "path": "/about", "name": "About", icon: Info },
  { "path": "/contact", "name": "Contact", icon: Phone },
  { "path": "/privacy", "name": "Privacy", icon: Lock },
  { "path": "/terms", "name": "Terms", icon: FileText },
  { "path": "/faq", "name": "FAQ", icon: HelpCircle },
  { "path": "/auth/register", "name": "Register", icon: UserPlus },
  { "path": "/auth/login", "name": "Login", icon: LogIn },
];


export const socialLinks = [
  { url: "https://www.linkedin.com/in/osm-store-management/", icon: FaLinkedin, name: "LinkedIn" },
  { url: "https://www.github.com/osm-optics-store-management/", icon: FaGithub, name: "GitHub" },
  { url: "https://wa.me/+966540919725", icon: FaWhatsapp, name: "WhatsApp" },
  { url: "https://www.facebook.com/hasin.taha/", icon: FaFacebook, name: "Facebook" },
  { url: "https://www.tiktok.com/@hussaintaha9184", icon: FaTiktok, name: "TikTok" },
  { url: "https://www.youtube.com/@hussaintaha9184", icon: FaYoutube, name: "YouTube" },
  { url: "https://www.instagram.com/hasin.taha/", icon: FaInstagram, name: "Instagram" },
  { url: "https://www.twitter.com/hasin.taha/", icon: FaXTwitter, name: "X (Twitter)" },
  { url: "mailto:hasin3112@gmail.com", icon: FiMail, name: "Email" },
];

export const otherLinks = [
  { path: "/support", name: "Support" },
  { path: "/careers", name: "Careers" },
  { path: "/blog", name: "Blog" },
];