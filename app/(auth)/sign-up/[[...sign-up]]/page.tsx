import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <main className="w-full flex">
      <div
        className="relative flex-1 hidden items-center justify-center h-screen lg:flex bg-cover bg-center"
        style={{ backgroundImage: "url(/backgroundPhoto.webp)" }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative pt-20 z-10 w-full max-w-md ">
          <Image
            src="/companyLogo.svg"
            width={400}
            height={100}
            className="top-35 relative right-30"
            alt="Logo"
          />
          <div className="top-40 right-23 relative space-y-3">
            <h3 className="text-white text-3xl font-bold">
              Properties That Suits You.
            </h3>
            <p className="text-gray-300">
              Create an account and get access to all properties.
            </p>
            <div className="flex items-center -space-x-2">
              <Image
                src="https://randomuser.me/api/portraits/women/79.jpg"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <Image
                src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=a72ca28288878f8404a795f39642a46f"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <Image
                src="https://randomuser.me/api/portraits/men/86.jpg"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <Image
                src="https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white"
                alt=""
              />
              <p className="text-sm text-gray-400 font-medium translate-x-5">
                Join our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center h-screen">
        <SignUp />
      </div>
    </main>
  );
}
