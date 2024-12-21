"use client";

import { useState } from "react";
import { saveAs } from "file-saver";

export default function PortfolioForm() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    about: "",
    skills: "",
    colors:"",
    projects: [""],
    contact: {
      email: "",
      linkedin: "",
      github: "",
    },
  });

  const [status, setStatus] = useState("idle");
  const [generatedCode, setGeneratedCode] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("idle");
  const [deployedUrl, setDeployedUrl] = useState("");

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, ""],
    }));
  };

  const updateProject = (index, value) => {
    const newProjects = [...formData.projects];
    newProjects[index] = value;
    setFormData((prev) => ({
      ...prev,
      projects: newProjects,
    }));
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("generating");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.code);
        setStatus("completed");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      setStatus("error");
      console.error("Generation failed:", error);
    }
  };

  const deployToS3 = async () => {
    setDeploymentStatus("deploying");

    try {
      const folderName = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: generatedCode, folderName }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeployedUrl(data.url);
        setDeploymentStatus("completed");
      } else {
        throw new Error(data.error || "Deployment failed");
      }
    } catch (error) {
      setDeploymentStatus("error");
      console.error("Deployment failed:", error);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/html;charset=utf-8" });
    saveAs(blob, "index.html");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver to-gray-300 via-gray-100 flex items-center justify-center p-6">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl rounded-xl max-w-5xl w-full p-10 space-y-10">
        <h1 className="text-4xl font-bold text-center drop-shadow-lg">
          Create Your Vibrant Portfolio
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div>
            <label className="block text-lg font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black"
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {/* Professional Role */}
          <div>
            <label className="block text-lg font-semibold mb-2">Professional Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
              placeholder="e.g., Full Stack Developer"
              required
            />
          </div>

          {/* About Me */}
          <div>
            <label className="block text-lg font-semibold mb-2">About Me</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              rows="4"
              placeholder="Write a brief introduction about yourself"
              required
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-lg font-semibold mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
              placeholder="e.g., JavaScript, React, Node.js"
              required
            />
          </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Color Pallete</label>
              <input
                type="text"
                value={formData.colors}
                onChange={(e) => setFormData({...formData,colors:e.target.value})}
                placeholder="Your color palette for website"
                className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
                required
              />
            </div>


          {/* Projects */}
          <div>
            <label className="block text-lg font-semibold mb-2">Projects</label>
            {formData.projects.map((project, index) => (
              <div key={index} className="flex gap-3 items-center mb-3">
                <input
                  type="text"
                  value={project}
                  onChange={(e) => updateProject(index, e.target.value)}
                  className="flex-1 p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black"
                  placeholder="Project description"
                  required
                />
                {formData.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="text-sm text-yellow-300 hover:text-yellow-400 font-medium"
            >
              + Add Project
            </button>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-lg font-semibold mb-2">Contact Information</label>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={formData.contact.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value },
                  })
                }
                className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
                required
              />
              

              <input
                type="url"
                placeholder="LinkedIn URL"
                value={formData.contact.linkedin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, linkedin: e.target.value },
                  })
                }
                className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-black"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={formData.contact.github}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, github: e.target.value },
                  })
                }
                className="w-full p-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-black"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-bold shadow-lg hover:opacity-90 disabled:opacity-50"
            disabled={status === "generating"}
          >
            {status === "generating" ? "Generating..." : "Generate Portfolio"}
          </button>
        </form>

        {/* Generated Code Section */}
        {status === "completed" && (
          <div className="mt-10 bg-white text-black p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Generated Code</h2>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
            <div className="mt-6 flex gap-4">
              <button
                onClick={downloadCode}
                className="bg-green-500 text-white py-2 px-4 rounded hover:opacity-90"
              >
                Download HTML
              </button>
              <button
                onClick={deployToS3}
                disabled={deploymentStatus === "deploying"}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:opacity-90 disabled:opacity-50"
              >
                {deploymentStatus === "deploying" ? "Deploying..." : "Deploy to S3"}
              </button>
            </div>
            {deploymentStatus === "completed" && (
              <div className="mt-4 bg-green-100 text-green-700 p-4 rounded">
                Successfully deployed! View your portfolio at:
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block mt-2 break-all"
                >
                  {deployedUrl}
                </a>
              </div>
            )}
            {deploymentStatus === "error" && (
              <div className="mt-4 bg-red-100 text-red-700 p-4 rounded">
                Deployment failed. Please try again.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
