"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/src/app/(mainLayout)/(LandingPage)/LandingPage/components/ui/navigation-menu";
import { BrainCircuitIcon, CalendarRangeIcon, CircleHelp, HashIcon, Newspaper, ShieldCheckIcon, UserCheckIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Icons from "../global/icons";

interface Props {
    title: string;
    href: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const Menu = () => {
    return (
        <NavigationMenu>
            <NavigationMenuList className="backdrop-blur-sm">
                <NavigationMenuItem>
                    <Link href="/how-it-works" legacyBehavior passHref>
                        <NavigationMenuLink className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-accent/20 transition-all duration-200">
                            How it works
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                        Features
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid rounded-3xl gap-3 p-6 md:w-[400px] lg:w-[500px] xl:w-[550px] lg:grid-cols-[.75fr_1fr] bg-background/80 backdrop-blur-xl border border-border/10">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/"
                                        className="flex flex-col justify-end w-full h-full p-6 no-underline rounded-2xl outline-none select-none bg-gradient-to-tr from-violet-500/20 to-blue-500/20 hover:from-violet-500/30 hover:to-blue-500/30 transition-all duration-300"
                                    >
                                        <Icons.icon className="w-8 h-8 text-violet-500" />
                                        <div className="my-3 text-xl font-medium bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
                                            Hirebit
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Find pre-verified candidates faster
                                        </p>
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                            <Item 
                                title="Triple Verification" 
                                href="/features/verification" 
                                icon={<ShieldCheckIcon className="w-5 h-5 text-violet-500" />}
                            >
                                Every profile verified through resume, skills, and video checks
                            </Item>
                            <Item 
                                title="Smart Matching" 
                                href="/features/matching" 
                                icon={<BrainCircuitIcon className="w-5 h-5 text-blue-500" />}
                            >
                                AI matches candidates to your exact job requirements
                            </Item>
                            <Item 
                                title="Quality Candidates" 
                                href="/features/quality" 
                                icon={<UserCheckIcon className="w-5 h-5 text-green-500" />}
                            >
                                Access only serious, actively job-seeking professionals
                            </Item>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px] xl:w-[500px]">
                            <Item title="Blog" href="/resources/blog" icon={<Newspaper className="w-5 h-5" />}>
                                Read our latest articles and updates.
                            </Item>
                            <Item title="Support" href="/resources/support" icon={<CircleHelp className="w-5 h-5" />}>
                                Get help with any issues you may have.
                            </Item>
                        </ul>
                        </NavigationMenuList>
        </NavigationMenu>
    )
};
               


const Item = ({ title, href, children, icon, ...props }: Props) => {
    return (
        <li>
           <NavigationMenuLink asChild>
                <Link
                    passHref
                    href={href}
                    {...props}
                    className="grid grid-cols-[.15fr_1fr] select-none space-y-1 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/20 hover:scale-[1.02] focus:bg-accent focus:text-accent-foreground group"
                >
                    <div className="flex items-center mt-1 justify-center p-2 w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm border border-border/20">
                        {icon}
                    </div>
                    <div className="text-start ml-4">
                        <span className="text-sm font-medium group-hover:text-foreground leading-none">
                            {title}
                        </span>
                        <p className="text-sm mt-1.5 line-clamp-2 text-muted-foreground/80">
                            {children}
                        </p>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
};

Item.displayName = "Item";

export default Menu
