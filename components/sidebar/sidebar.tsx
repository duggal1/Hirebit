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
import { useQuery } from "@tanstack/react-query";

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
    return <div className="p-6 text-neutral-400">Loading...</div>;
  }

  if (!company) {
    return (
      <div className="p-6 text-neutral-400">
        Please complete your company profile.
      </div>
    );
  }

  const menuItems = getMenuItems(userId, company.companyID);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? 300 : 80,
        transition: { duration: 0.3, ease: "easeInOut" },
      }}
      className="fixed left-0 top-0 h-screen bg-black/50 backdrop-blur-lg border-r border-neutral-800 shadow-2xl"
    >
      {/* Gradient overlay for a modern glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-6 right-3 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg hover:shadow-2xl transition-all z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Menu className="w-5 h-5 text-white" />
        </motion.div>
      </motion.button>

      {/* Logo Section */}
      <div className="relative p-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-white text-xl font-bold">H</span>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <span className="text-white text-lg font-semibold">
                  HireBit
                </span>
                <span className="text-sm text-gray-300">
                  Recruitment Suite
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative px-4 py-4 space-y-2">
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
                  transition-colors duration-300 cursor-pointer
                  ${isActive ? "bg-blue-600/40 text-white" : "text-gray-300 hover:bg-white/10"}
                `}
                whileHover={{ scale: 1.02 }}
              >
                {/* Icon with a glowing modern touch */}
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-blue-500/30 rounded-xl blur-md"
                    />
                  )}
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-6 h-6 relative z-10" />
                  </motion.div>
                </div>

                {/* Label */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-base font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Subtle arrow indicator */}
                <AnimatePresence>
                  {isHovered && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="ml-auto"
                    >
                      <ChevronRight className="w-5 h-5 text-white/70" />
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
