import { LoginForm } from "@/components/forms/LoginForm";

import Link from "next/link";
import React from "react";
import Logo from "@/public/logo.png";
import Image from "next/image";

const LoginPage = () => {
  return (
  <div className="min-h-screen w-screen flex items-center justify-center bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex flex-col items-center gap-2 self-center">
          <Image src={Logo} alt="Logo" className="h-20 w-20" />
         
        </Link>
        <div className="text-6xl text-white font-black">
            Hire
            <span className="text-blue-600">bit</span>
          </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
