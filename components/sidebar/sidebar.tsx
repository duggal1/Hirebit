"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Video,
  CreditCard,
  Settings,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useSession } from "next-auth/react";

// Define type for Company from session
interface Company {
    id: string;
    companyID: string;
    name: string;
    // ... other fields
  }
  
  interface SessionUser {
    id: string;
    email?: string | null;
    Company?: Company | null;
    // ... other fields
  }
  
  // Update getMenuItems to use proper types
  const getMenuItems = (userId?: string, companyID?: string) => [
    {
      id: 1,
      label: "Dashboard",
      icon: LayoutDashboard,
      link: `/dashboard/${userId}/${companyID}` 
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
    const { data: session } = useSession();
  
    // Safely access user and company data with proper type checking
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id;
    const companyID = user?.Company?.companyID;
  
    // Get menu items with dynamic dashboard link
    const menuItems = getMenuItems(userId, companyID);
  
  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isExpanded ? 320 : 80,
        transition: { 
          duration: 0.5, 
          type: "spring",
          stiffness: 200,
          damping: 25
        }
      }}
      className="fixed left-0 top-0 h-screen bg-black  overflow-hidden"
    >
      {/* Sophisticated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-blue-500/10" />
        <div className="absolute h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <motion.div 
          className="absolute -left-32 top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -right-32 bottom-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Premium Border Effect */}
      <div className="absolute inset-0 border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/0 to-white/5" />
      </div>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-6 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "anticipate" }}
        >
          <Menu className="w-5 h-5 text-zinc-400" />
        </motion.div>
      </motion.button>

      {/* Logo Section */}
      <div className="relative p-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 p-0.5"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-black/50 rounded-xl blur-sm" />
            <div className="relative h-full w-full bg-zinc-900/90 rounded-[10px] flex items-center justify-center">
              <span className="text-white text-xl font-bold">H</span>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col"
              >
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  HireBit
                </motion.span>
                <motion.span 
                  className="text-xs text-zinc-500"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Recruitment Suite
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="relative px-3 py-6">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.link;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          
          return (
            <Link href={item.link} key={item.id}>
              <motion.div
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative group flex items-center gap-4 px-4 py-4 mb-2
                  rounded-xl cursor-pointer
                  ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}
                `}
              >
                {/* Hover Effect */}
                <AnimatePresence>
                  {(isHovered || isActive) && (
                    <motion.div
                      layoutId="hoverBackground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-fuchsia-500/20" />
                      <div className="absolute inset-0 rounded-xl bg-black/20 backdrop-blur-sm" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10"
                >
                  <div className={`
                    p-2 rounded-lg transition-colors duration-300
                    ${isActive ? 'bg-gradient-to-br from-violet-500/80 to-blue-500/80 shadow-lg' : 'bg-white/5'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="relative z-10 text-sm font-medium tracking-wide"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-full bg-gradient-to-b from-violet-500 via-blue-500 to-fuchsia-500 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Arrow */}
                <AnimatePresence>
                  {isHovered && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto relative z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="h-48 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}