import { LoginForm } from "@/components/forms/LoginForm";

import Link from "next/link";
import React from "react";
import Logo from "@/public/logo.png";
import Image from "next/image";

const LoginPage = () => {
  return (
  <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex flex-col justify-center items-center">
          <Image src={Logo} alt="Logo" className="h-20 w-20" />
         
        </Link>
        <div className="flex flex-col  justify-center items-center">
        <div className="text-5xl  text-white font-black">
            Hire
            <span className="text-blue-600">bit</span>
          </div>
          </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
