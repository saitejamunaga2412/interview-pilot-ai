import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaSearch, FaBuilding, FaStar } from "react-icons/fa";

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/company/all");
      setCompanies(res.data.data.companies);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // Hardcode the list of requested companies so users can click them to trigger AI generation if they don't exist yet in the DB
  const standardList = ["TCS", "Infosys", "Accenture", "Cognizant", "Capgemini", "Wipro", "Deloitte", "IBM", "Google", "Amazon", "Microsoft", "Oracle", "Adobe", "Meta"];
  
  const displayList = search ? filteredCompanies : standardList.map(name => {
    const existing = companies.find(c => c.name.toLowerCase() === name.toLowerCase());
    return existing || { name, tier: ["Google", "Amazon", "Microsoft", "Meta"].includes(name) ? "Tier 1" : "Tier 3", difficultyLevel: ["Google", "Amazon", "Microsoft", "Meta"].includes(name) ? 9 : 5, isNew: true };
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
            Company <span className="text-blue-600 dark:text-blue-400">Preparation</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Select a company to view its detailed recruitment process, pattern, roadmap, and AI mentor.
          </p>
        </div>

        <div className="relative mb-12 max-w-2xl mx-auto">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a company..."
            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 text-lg shadow-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayList.map((company, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/company/${company.name}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-500 cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaBuilding className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-1">{company.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{company.tier}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar /> <span className="text-sm font-semibold">{company.difficultyLevel}/10</span>
                </div>
                {company.isNew && (
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">Auto-Generate</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
