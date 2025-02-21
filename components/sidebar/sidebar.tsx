"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image"; // Added Image import
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Video,
  CreditCard,
  Settings,
  ChevronRight,
  Menu,
  Search,
} from "lucide-react";
import LoadingState from "../loading/Loadingstate/loading";

interface Company {
  id: string;
  companyID: string;
  name: string;
}

interface SessionUser {
  id: string;
  email?: string | null;
}

const getMenuItems = (userId?: string, companyID?: string) => [
  {
    id: 1,
    label: "Dashboard",
    icon: LayoutDashboard,
    link: `/dashboard/${userId || "no-user"}/${companyID || "no-company"}`,
  },
  { id: 2, label: "Job Listings", icon: Briefcase, link: "/jobs" },
  { id: 3, label: "Applications", icon: FileText, link: "/applications" },
  { id: 4, label: "Interviews", icon: Video, link: "/interviews" },
  { id: 5, label: "Billing", icon: CreditCard, link: "/billing" },
  { id: 6, label: "Settings", icon: Settings, link: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { data: session, status } = useSession();

  const user = session?.user as SessionUser | undefined;
  const userId = user?.id;
  const { data: company, isLoading: isCompanyLoading } = useQuery<Company>({
    queryKey: ["company", userId],
    queryFn: async () => {
      const response = await fetch("/api/companys");
      if (!response.ok) throw new Error("Failed to fetch company");
      return response.json();
    },
    enabled: !!userId,
  });

  if (status === "loading" || isCompanyLoading) {
    return <LoadingState />;
  }

  if (!company) {
    return null;
  }

  const menuItems = getMenuItems(userId, company.companyID);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? 320 : 80,
        transition: { duration: 0.8, type: "spring", stiffness: 100 },
      }}
      className="fixed left-0 top-0 h-screen z-50 overflow-hidden"
    >
      {/* Glassmorphism background with animated gradients */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(29,78,216,0.15), transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(29,78,216,0.15), transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(29,78,216,0.15), transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.15), transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 opacity-30"
      />
      
      {/* Animated noise texture */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-soft-light">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] animate-[noise_1s_infinite]" />
      </div>

      {/* Glass border effect */}
      <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-white/5 via-white/10 to-white/5" />

      {/* Toggle button with futuristic design */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-6 -right-3 p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] z-50"
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ 
            rotate: isExpanded ? 180 : 0,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 0.5,
            scale: {
              duration: 0.2,
              times: [0, 0.5, 1]
            }
          }}
        >
          <Menu className="w-4 h-4 text-white/80" />
        </motion.div>
      </motion.button>

      {/* Logo section with holographic effect */}
      <div className="relative p-6">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="relative w-12 h-12 rounded-full overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-180 animate-[spin_4s_linear_infinite]" />
            <motion.div
              className="relative z-10 w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex flex-col items-center gap-2 self-center">
                {/* Updated Image component with valid src */}
                <Image src="/logo.png" alt="Logo" width={150} height={100} className="h-30 w-30" />
              </Link>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                <motion.span
                  className="text-white/90 text-sm font-light tracking-[0.2em]"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  HIREBIT
                </motion.span>
                <motion.span
                  className="text-[10px] text-white/50 uppercase tracking-[0.3em]"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Enterprise
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Futuristic search bar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="px-6 mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute inset-0 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 bg-white/5 rounded-xl pl-10 pr-4 text-sm text-white/80 placeholder-white/30 border border-white/10 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation with enhanced interactions */}
      <nav className="relative px-4 py-2 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.link;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;

          return (
            <Link href={item.link} key={item.id}>
              <motion.div
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                className={`
                  relative flex items-center gap-4 px-4 py-3 rounded-xl
                  transition-all duration-300 cursor-pointer group
                  ${isActive 
                    ? "bg-white/10 text-white/90 border border-white/10" 
                    : "text-white/50 hover:text-white/90"}
                `}
                whileHover={{ x: 4, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(45deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
                  }}
                />

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8"
                  >
                    <div className="w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 rounded-full blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-purple-400 to-blue-400 rounded-full animate-pulse" />
                  </motion.div>
                )}

                {/* Icon with hover animation */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="relative w-6 h-6 flex items-center justify-center"
                >
                  <Icon className="w-4 h-4 relative z-10" />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-blue-500/20 blur-md rounded-full"
                    />
                  )}
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="text-xs tracking-wider font-light"
                    >
                      {item.label.toUpperCase()}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Hover indicator */}
                <AnimatePresence>
                  {isHovered && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -4 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -4 }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto"
                    >
                      <ChevronRight className="w-4 h-4 text-white/50" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
}
