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
  LucideIcon
} from "lucide-react";

export interface NavItem {
  path: string;
  name: string;
  icon: LucideIcon;
}

export const URLDATA: NavItem[] = [
  { "path": "/", "name": "Home", icon: Home },
  { "path": "/dashboard", "name": "dashboard", icon: Shield },
  { "path": "/profile", "name": "Profile", icon: User },
  { "path": "/admin", "name": "Admin", icon: Shield },
  { "path": "/dashboard/invoices", "name": "Invoices", icon: FileText },
  { "path": "/dashboard/payments", "name": "Payments", icon: CreditCard },
  // { "path": "/prescriptions", "name": "Prescriptions", icon: Eye },
  // { "path": "/about", "name": "About", icon: Info },
  // { "path": "/contact", "name": "Contact", icon: Phone },
  { "path": "/users", "name": "Users", icon: Users },
  // { "path": "/tenants", "name": "Tenants", icon: Building2 },
  // { "path": "/groups", "name": "Groups", icon: Users },
  // { "path": "/crm", "name": "CRM", icon: BarChart3 },
  // { "path": "/products/supplier", "name": "Suppliers", icon: Truck },
];

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