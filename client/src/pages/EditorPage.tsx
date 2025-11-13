import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  Share2,
  LogOut,
  Video,
  ImageIcon,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addJob,
  deleteJob,
  getCompany,
  getJobs,
  publishCompany,
  updateCompany,
} from "../api/api";
import toast, { Toaster } from "react-hot-toast";

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
  _id?: string;
  id?: string;
  title: string;
  location: string;
  jobType: string;
  department?: string;
  description?: string;
}

const EditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brandColor: "#3b82f6",
    logo: "",
    banner: "",
    cultureVideo: "",
    sections: [] as Section[],
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState<Job>({
    title: "",
    location: "",
    jobType: "",
    department: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch company data
  useEffect(() => {
    if (!slug) return;
    const fetchCompany = async () => {
      try {
        const res = await getCompany(slug);
        const companyData = res.data;
        setCompany(companyData);
        setFormData({
          name: companyData.name,
          brandColor: companyData.settings?.brandColor || "#3b82f6",
          logo: companyData.settings?.logo || "",
          banner: companyData.settings?.banner || "",
          cultureVideo: companyData.settings?.cultureVideo || "",
          sections: companyData.settings?.sections || [],
        });
      } catch (err) {
        console.error("Error fetching company:", err);
      }
    };
    fetchCompany();
  }, [slug]);

  // Fetch jobs for this company
  useEffect(() => {
    if (!slug) return;
    const loadJobs = async () => {
      try {
        const res = await getJobs({ companySlug: slug });
        console.log("Jobs fetched:", res.data);

        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    loadJobs();
  }, [slug]);

  // Save company settings
  const handleSave = async () => {
    if (!slug) return;
    setSaving(true);
    try {
      const res = await updateCompany(slug, formData);

      setCompany(res.data);
      toast.success("Changes saved successfully!")
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Publish company page
  const handlePublish = async () => {
    await handleSave();
    try {
      await publishCompany(slug!);
      toast.success(
        <div className="max-w-[400px] break-words">
          Page published! <br />
          Share your link:{" "}
          <a
            href={`https://whitecarrot.netlify.app/${slug}/careers`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            https://whitecarrot.netlify.app/{slug}/careers
          </a>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  // Navigation handlers
  const handlePreview = () => navigate(`/${slug}/preview`);
  const handleLogout = () => {
    localStorage.removeItem("companySlug");
    navigate("/");
  };

  // Section Management
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Date.now().toString(),
          type: "custom",
          title: "New Section",
          content: "",
          order: prev.sections.length,
        },
      ],
    }));
    toast.success("New section added")
  };

  const updateSection = (id: string, field: keyof Section, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const deleteSection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
    toast.success("Section deleted")
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = formData.sections.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.sections.length - 1)
    )
      return;

    const newSections = [...formData.sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ];
    setFormData({ ...formData, sections: newSections });
  };

  // Job Management Handlers
  const handleAddJob = async () => {
    if (!slug || !newJob.title) {
      toast.error("Please provide a job title.");
      return;
    }

    try {
      const res = await addJob(slug, newJob);

      if (res.data.success) {
        setJobs((prev) => [...prev, newJob]);
        setNewJob({
          title: "",
          location: "",
          jobType: "",
          department: "",
          description: "",
        });
        toast.success("Job added successfully!");
      }
    } catch (error) {
      console.error("Add job error:", error);
    }
  };

  const handleDeleteJob = async (id?: string) => {
    if (!id) {
      toast.error("Invalid job ID");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteJob(id);

      if (res.data.success) {
        setJobs((prev) =>
          prev.filter((job) => job._id !== id && job.id !== id)
        );
        toast.success("Job deleted successfully!");
      } else {
        toast.error(
          "Failed to delete job: " + (res.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Delete job error:", error);
      toast.error("Server error while deleting job.");
    }
  };

  if (!company)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading company data...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Careers Page
            </h1>
            <p className="text-sm text-gray-600">/{company.slug}/careers</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye size={18} /> Preview
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={18} /> {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Share2 size={18} /> Publish
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Brand Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Brand Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Slug
              </label>
              <input
                type="text"
                value={company?.slug || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                This slug is used in your company URL:{" "}
                <strong>/{company?.slug || "your-company"}/careers</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) =>
                    setFormData({ ...formData, brandColor: e.target.value })
                  }
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) =>
                    setFormData({ ...formData, brandColor: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon size={16} className="inline mr-1" /> Logo URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon size={16} className="inline mr-1" /> Banner Image URL
              </label>
              <input
                type="url"
                value={formData.banner}
                onChange={(e) =>
                  setFormData({ ...formData, banner: e.target.value })
                }
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video size={16} className="inline mr-1" /> Culture Video URL
                (YouTube embed)
              </label>
              <input
                type="url"
                value={formData.cultureVideo}
                onChange={(e) =>
                  setFormData({ ...formData, cultureVideo: e.target.value })
                }
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div> */}
            
          </div>
        </div> 

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Content Sections</h2>
            <button
              onClick={addSection}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} /> Add Section
            </button>
          </div>

          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveSection(section.id, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, "down")}
                      disabled={index === formData.sections.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, "title", e.target.value)
                    }
                    className="flex-1 px-3 py-1 font-semibold border border-gray-300 rounded"
                  />

                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <textarea
                  value={section.content}
                  placeholder={
                    section.type === "about"
                      ? "Tell your story..."
                      : section.type === "culture"
                        ? "Describe your culture..."
                        : "Add your content here..."
                  }
                  onChange={(e) =>
                    updateSection(section.id, "content", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* JOB MANAGEMENT SECTION */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Job Management</h2>

          {/* Job Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Location"
              value={newJob.location}
              onChange={(e) =>
                setNewJob({ ...newJob, location: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Job Type (e.g. Full-Time)"
              value={newJob.jobType}
              onChange={(e) =>
                setNewJob({ ...newJob, jobType: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Department"
              value={newJob.department}
              onChange={(e) =>
                setNewJob({ ...newJob, department: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <textarea
            placeholder="Job Description"
            value={newJob.description}
            onChange={(e) =>
              setNewJob({ ...newJob, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 min-h-[100px]"
          />

          <button
            onClick={handleAddJob}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Job
          </button>

          {/* Jobs List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Existing Jobs</h3>
            {jobs.length === 0 ? (
              <p className="text-gray-500">No jobs added yet.</p>
            ) : (
              <ul className="space-y-3">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">
                        {job.location} • {job.jobType}
                      </p>
                      {job.department && (
                        <p className="text-sm text-gray-500">
                          Dept: {job.department}
                        </p>
                      )}
                      {job.description && (
                        <p className="text-gray-700 mt-2 text-sm">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job._id || job.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default EditorPage;
