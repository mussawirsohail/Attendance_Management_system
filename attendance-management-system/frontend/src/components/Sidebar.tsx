"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Home, Users, Calendar, BarChart3, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Students", href: "/students", icon: <Users className="h-5 w-5" /> },
    { label: "Attendance", href: "/attendance", icon: <Calendar className="h-5 w-5" /> },
    { label: "Reports", href: "/reports", icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? "280px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:block md:w-64 lg:w-72 bg-sidebar text-sidebar-foreground flex flex-col border-r"
      >
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Attendance System</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full justify-start"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
          
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      {isOpen && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r md:hidden"
        >
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Attendance System</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={toggleSidebar}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full justify-start"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
            
            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}