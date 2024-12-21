import PortfolioForm from "@/components/PortfolioForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Portfolio Website Generator
        </h1>
        <PortfolioForm />
      </div>
    </main>
  );
}
