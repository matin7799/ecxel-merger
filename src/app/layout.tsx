// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
    title: 'برنامه تبدیل اکسل به قالب سفارشی',
    description: 'برنامه وب فارسی برای تبدیل داده‌های اکسل به قالب‌های سفارشی',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fa" dir="rtl">
        <body className={`${vazirmatn.variable} font-sans bg-background min-h-screen`}>
        {children}
        </body>
        </html>
    );
}
