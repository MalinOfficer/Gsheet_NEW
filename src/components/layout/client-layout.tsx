
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BarChart, GanttChartSquare, Settings, Loader2, ListTree, GitBranch, Files, Combine, CodeXml, FileCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { TableDataContext } from "@/store/table-data-context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import React from "react";


const primaryNavItems = [
    { href: "/", label: "Import Flow", icon: ListTree },
    { href: "/report-harian", label: "Daily Report", icon: BarChart },
];

const secondaryNavItems = [
    { href: "/migrasi-murid", label: "Migrasi Murid", description: "Alat mirip spreadsheet untuk memformat data migrasi siswa.", icon: GitBranch },
    { href: "/cek-duplikasi", label: "Cek Duplikasi", description: "Temukan NIS duplikat atau data tidak valid di beberapa file Excel.", icon: Files },
    { href: "/data-weaver", label: "Data Weaver", description: "Gabungkan dua file Excel berdasarkan kolom yang sama.", icon: Combine },
    { href: "/data-normalisasi", label: "Data Normalisasi", description: "Transfer data antar kolom dari dua file Excel berbeda.", icon: FileCog },
    { href: "/code-viewer", label: "Code Viewer", description: "Tampilkan dan unduh seluruh kode sumber aplikasi ini.", icon: CodeXml },
]

function NavLinksDesktop() {
    const pathname = usePathname();

    return (
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {primaryNavItems.map((item) => (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                  href={item.href}
                  active={pathname === item.href}
                  className={navigationMenuTriggerStyle()}
                >
                  <item.icon className="h-4 w-4 mr-2 shrink-0" />
                  {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuTrigger>
                More Tools
            </NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {secondaryNavItems.map((item) => (
                         <ListItem
                            key={item.label}
                            href={item.href}
                            title={item.label}
                            icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                    ))}
                </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
}

function NavLinksMobile() {
    const pathname = usePathname();
    const allNavItems = [...primaryNavItems, ...secondaryNavItems];

    return (
        <>
            {allNavItems.map((item) => (
                <SheetClose asChild key={item.label}>
                    <Link
                        href={item.href}
                        className={cn(
                            "flex items-center justify-start rounded-lg px-2 py-1.5 mb-1 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                            pathname === item.href && "bg-accent text-accent-foreground font-semibold"
                        )}
                    >
                        <item.icon className="h-4 w-4 mr-3 shrink-0" />
                        <span className="truncate">{item.label}</span>
                    </Link>
                </SheetClose>
=======
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BarChart, GanttChartSquare, Settings, Loader2, ListTree, GitBranch, Files, Combine, CodeXml, FileCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { TableDataContext } from "@/store/table-data-context";

const navItems = [
    { href: "/", label: "Import Flow", icon: ListTree },
    { href: "/report-harian", label: "Daily Report", icon: BarChart },
    { href: "/migrasi-murid", label: "Migrasi Murid", icon: GitBranch },
    { href: "/cek-duplikasi", label: "Cek Duplikasi", icon: Files },
    { href: "/data-weaver", label: "Data Weaver", icon: Combine },
    { href: "/data-normalisasi", label: "Data Normalisasi", icon: FileCog },
    { href: "/code-viewer", label: "Code Viewer", icon: CodeXml },
];

function NavLinks() {
    const pathname = usePathname();
    const { setIsProcessing } = useContext(TableDataContext);

    const handleLinkClick = (href: string) => {
        if (pathname !== href) {
            setIsProcessing(true);
        }
    };

    return (
        <>
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className={cn(
                        "flex items-center justify-start rounded-lg px-2 py-1.5 mb-1 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href && "bg-accent text-accent-foreground font-semibold"
                    )}
                >
                    <item.icon className="h-4 w-4 mr-3 shrink-0" />
                    <span className="truncate">{item.label}</span>
                </Link>
>>>>>>> 87b9b2c7dc9455649ded2497aa6580eb7cb6fe12
            ))}
        </>
    );
}

function ProcessingIndicator() {
    const { isProcessing } = useContext(TableDataContext);
    if (!isProcessing) return null;

    return (
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
        </div>
    );
}

<<<<<<< HEAD
=======
const LOCAL_STORAGE_KEY_SIDEBAR_WIDTH = 'sidebarWidth';
const MIN_WIDTH = 200; // 50rem
const MAX_WIDTH = 500; // 125rem
>>>>>>> 87b9b2c7dc9455649ded2497aa6580eb7cb6fe12

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isProcessing, setIsProcessing } = useContext(TableDataContext);
    const pathname = usePathname();
<<<<<<< HEAD
    const [isClient, setIsClient] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setIsProcessing(false);
    }, [pathname, setIsProcessing]);

    if (!isClient) {
        return (
             <div className="flex-1 flex flex-col bg-background">
                {children}
            </div>
        );
    }
    
    return (
        <div className={cn("flex min-h-screen w-full flex-col", isProcessing && "pointer-events-none")}>
             <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu for Mobile */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
=======
    const [sidebarWidth, setSidebarWidth] = useState(200);
    const isResizing = useRef(false);

    useEffect(() => {
        const savedWidth = localStorage.getItem(LOCAL_STORAGE_KEY_SIDEBAR_WIDTH);
        if (savedWidth) {
            setSidebarWidth(Number(savedWidth));
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        localStorage.setItem(LOCAL_STORAGE_KEY_SIDEBAR_WIDTH, String(sidebarWidth));
    }, [sidebarWidth]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing.current) {
            let newWidth = e.clientX;
            if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
            if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
            setSidebarWidth(newWidth);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    useEffect(() => {
        // When page navigation completes, turn off the processing indicator.
        setIsProcessing(false);
    }, [pathname, setIsProcessing]);


    return (
        <div className={cn("flex min-h-screen w-full", isProcessing && "pointer-events-none")}>
            {/* Sidebar for Desktop */}
            <aside 
                className="hidden md:flex flex-col relative bg-card text-card-foreground border-r"
                style={{ width: `${sidebarWidth}px` }}
            >
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                        <GanttChartSquare className="h-6 w-6" />
                        <span>GSheet Tools</span>
                    </Link>
                </div>
                <nav className="flex-1 flex flex-col p-2 text-sm font-medium">
                    <NavLinks />
                    <ProcessingIndicator />
                </nav>
                 <div className="mt-auto p-4">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center justify-start rounded-lg px-3 py-2 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                            pathname === "/settings" && "bg-accent text-accent-foreground font-semibold"
                        )}
                        onClick={() => {
                            if (pathname !== "/settings") {
                                setIsProcessing(true);
                            }
                        }}
                    >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                    </Link>
                </div>
                <div 
                    className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-border hover:bg-primary transition-colors duration-200"
                    onMouseDown={handleMouseDown}
                />
            </aside>

            <div className="flex flex-col flex-1">
                {/* Header for Mobile */}
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
>>>>>>> 87b9b2c7dc9455649ded2497aa6580eb7cb6fe12
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
<<<<<<< HEAD
                            <SheetHeader className="mb-4">
                                <SheetTitle asChild>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 font-semibold text-primary"
                                    >
                                        <GanttChartSquare className="h-6 w-6" />
                                        <span>GSheet Tools</span>
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="grid gap-2 text-base font-medium">
                                <NavLinksMobile />
                                <ProcessingIndicator />
                            </nav>
                            <div className="mt-auto">
                                <SheetClose asChild>
                                     <Link
                                        href="/settings"
                                        className={cn(
                                            "flex items-center justify-start rounded-lg px-3 py-2 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                                            pathname === "/settings" && "bg-accent text-accent-foreground font-semibold"
                                        )}
                                    >
                                        <Settings className="h-5 w-5 mr-3" />
                                        Settings
                                    </Link>
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                    
                    {/* Desktop Logo */}
                    <Link href="/" className="hidden md:flex items-center gap-2 font-semibold text-primary">
                        <GanttChartSquare className="h-6 w-6" />
                        <span className="text-lg">GSheet Tools</span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <NavLinksDesktop />
                </div>

                {/* Right side of header */}
                <div className="flex items-center gap-2">
                    <div className="hidden md:block">
                        <ProcessingIndicator />
                    </div>
                     <Link
                        href="/settings"
                        className={cn(
                            "flex items-center justify-center rounded-full h-9 w-9 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                             pathname === "/settings" && "bg-accent text-accent-foreground"
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex flex-col bg-background">{children}</main>
        </div>
    );
}


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ElementType }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem"
=======
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>
                                    A list of pages to navigate to.
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary"
                                >
                                    <GanttChartSquare className="h-6 w-6" />
                                    <span>GSheet Tools</span>
                                </Link>
                                <NavLinks />
                                <ProcessingIndicator />
                            </nav>
                            <div className="mt-auto">
                                <Link
                                    href="/settings"
                                    className={cn(
                                        "flex items-center justify-start rounded-lg px-3 py-2 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                                         pathname === "/settings" && "bg-accent text-accent-foreground font-semibold"
                                    )}
                                    onClick={() => {
                                        if (pathname !== "/settings") {
                                            setIsProcessing(true);
                                        }
                                    }}
                                >
                                    <Settings className="h-5 w-5 mr-3" />
                                    Settings
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                     <div className="flex w-full items-center justify-start gap-4">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                            <GanttChartSquare className="h-6 w-6" />
                            <span className="text-base">GSheet Tools</span>
                        </Link>
                    </div>
                </header>
                <main className="flex-1 flex flex-col bg-background">{children}</main>
            </div>
        </div>
    );
}
>>>>>>> 87b9b2c7dc9455649ded2497aa6580eb7cb6fe12
