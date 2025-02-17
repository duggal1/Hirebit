import { Navbar } from "@/components/general/Navbar";
import { AutoSaveHeaderWrapper } from "@/components/resume/src/app/components/header/AutoSaveHeaderWrapper";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
      <Navbar />
   
      {children}
    </div>
  );
};

export default MainLayout;
