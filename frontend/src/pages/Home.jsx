import { useNavigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";

function Home() {
  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-200">
      <div className="mx-auto w-full">
        <Dashboard />
      </div>
    </div>
  );
}

export default Home;