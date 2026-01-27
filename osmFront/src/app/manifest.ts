import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'نظام البصريات الشامل',
        short_name: 'OSM',
        description: 'نظام إدارة محلات البصريات الشامل - Optics Store Manager',
        start_url: '/ar/dashboard',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        orientation: 'portrait-primary',
        lang: 'ar',
        dir: 'rtl',
        icons: [
            {
                src: '/logo2.png',
                sizes: 'any',
                type: 'image/png',
            }
        ],
        categories: ["business", "productivity"],
        shortcuts: [
            {
                name: "طلب جديد",
                short_name: "طلب جديد",
                description: "إنشاء طلب جديد",
                url: "/ar/dashboard/orders/new",
                icons: [{ src: "/logo2.png", sizes: "96x96" }]
            },
            {
                name: "المنتجات",
                short_name: "المنتجات",
                description: "إدارة المنتجات",
                url: "/ar/dashboard/products",
                icons: [{ src: "/logo2.png", sizes: "96x96" }]
            },
            {
                name: "العملاء",
                short_name: "العملاء",
                description: "إدارة العملاء",
                url: "/ar/dashboard/customers",
                icons: [{ src: "/logo2.png", sizes: "96x96" }]
            }
        ],
        prefer_related_applications: false,
    };
}
