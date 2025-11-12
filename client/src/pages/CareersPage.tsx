import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { useParams } from "react-router-dom";
import { getCompany, getJobFilters, getJobs } from "../api/api";

// ============ TYPES ============
interface Section {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
}

interface Settings {
  brandColor: string;
  logo: string;
  banner: string;
  cultureVideo: string;
  sections: Section[];
}

interface Company {
  name: string;
  slug: string;
  settings?: Settings;
}

interface Job {
  id?: string;
  title: string;
  location: string;
  jobType: string;
  department?: string;
  description?: string;
}

interface FilterState {
  location: string;
  jobType: string;
  search: string;
}

interface AvailableFilters {
  locations: string[];
  jobTypes: string[];
}

const CareersPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    location: "all",
    jobType: "all",
    search: "",
  });
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    locations: [],
    jobTypes: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch company and filters
  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const companyRes = await getCompany(slug);
        const companyData: Company = companyRes.data;
        setCompany(companyData);

        const filtersRes = await getJobFilters(slug);
        const filtersData: AvailableFilters = filtersRes.data;
        setAvailableFilters(filtersData);
      } catch (error: any) {
        console.error(
          "Error loading data:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  // Fetch jobs whenever filters change
  useEffect(() => {
    if (!company || !slug) return;

    const loadJobs = async () => {
      try {
        const res = await getJobs({
          companySlug: slug,
          location: filters.location,
          jobType: filters.jobType,
          search: filters.search,
        });

        const data: Job[] = res.data;
        setJobs(data);
      } catch (err: any) {
        console.error("Job load error:", err.response?.data || err.message);
      }
    };

    loadJobs();
  }, [filters, company, slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );

  if (!company)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Company not found
      </div>
    );

  const brandColor = company.settings?.brandColor || "#3b82f6";

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      {company.settings?.banner && (
        <div className="w-full h-64 bg-gray-200 overflow-hidden">
          <img
            src={company.settings.banner}
            alt="Company banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: brandColor, backgroundColor: `${brandColor}10` }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          {company.settings?.logo && (
            <img
              src={company.settings.logo}
              alt={company.name}
              className="w-16 h-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brandColor }}>
              {company.name}
            </h1>
            <p className="text-gray-600">Careers</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Content Sections */}
        {company.settings?.sections?.map((section) => (
          <section
            key={section.id}
            className="mb-12 border-l-4 pl-4"
            style={{ borderColor: brandColor }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: brandColor }}
            >
              {section.title}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {section.content}
            </p>
          </section>
        ))}

        {/* Culture Video */}
        {company.settings?.cultureVideo && (
          <section
            className="mb-12 border-l-4 pl-4"
            style={{ borderColor: brandColor }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: brandColor }}
            >
              Culture Video
            </h2>
            <div className="aspect-video">
              <iframe
                src={company.settings.cultureVideo}
                className="w-full h-full rounded-lg border"
                style={{ borderColor: brandColor }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Jobs Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6" style={{ color: brandColor }}>
            Open Positions
          </h2>

          {/* Filters */}
          <div
            className="rounded-lg p-4 mb-6 border"
            style={{ borderColor: brandColor }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search job title..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  style={{
                    borderColor: brandColor,
                    outlineColor: brandColor,
                    caretColor: brandColor,
                  }}
                />
              </div>

              <select
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none"
                style={{ borderColor: brandColor }}
              >
                <option value="all">All Locations</option>
                {availableFilters.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={filters.jobType}
                onChange={(e) =>
                  setFilters({ ...filters, jobType: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none"
                style={{ borderColor: brandColor }}
              >
                <option value="all">All Job Types</option>
                {availableFilters.jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No jobs found matching your criteria
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                  style={{
                    borderColor: `${brandColor}80`,
                    boxShadow: `0 0 0 0px ${brandColor}10`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}40`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 0px ${brandColor}10`)
                  }
                >
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: brandColor }}
                  >
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={16} />
                      {job.jobType}
                    </span>
                    {job.department && (
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: `${brandColor}15`,
                          color: brandColor,
                        }}
                      >
                        {job.department}
                      </span>
                    )}
                  </div>
                  {job.description && (
                    <p className="mt-3 text-gray-700 line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer
        className="border-t mt-20 text-center py-8"
        style={{ borderColor: brandColor, backgroundColor: `${brandColor}05` }}
      >
        <div className="max-w-6xl mx-auto px-4 text-gray-600">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CareersPage;
