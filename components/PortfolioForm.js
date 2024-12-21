'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';

export default function PortfolioForm() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    about: '',
    skills: '',
    projects: [''],
    contact: {
      email: '',
      linkedin: '',
      github: ''
    }
  });

  const [status, setStatus] = useState('idle');
  const [generatedCode, setGeneratedCode] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [deployedUrl, setDeployedUrl] = useState('');

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, '']
    }));
  };

  const updateProject = (index, value) => {
    const newProjects = [...formData.projects];
    newProjects[index] = value;
    setFormData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('generating');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.code);
        setStatus('completed');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      setStatus('error');
      console.error('Generation failed:', error);
    }
  };

  const deployToS3 = async () => {
    setDeploymentStatus('deploying');
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: generatedCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeployedUrl(data.url);
        setDeploymentStatus('completed');
      } else {
        throw new Error(data.error || 'Deployment failed');
      }
    } catch (error) {
      setDeploymentStatus('error');
      console.error('Deployment failed:', error);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html;charset=utf-8' });
    saveAs(blob, 'portfolio.html');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Professional Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            placeholder="e.g., Full Stack Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">About Me</label>
          <textarea
            value={formData.about}
            onChange={(e) => setFormData({...formData, about: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Projects</label>
          {formData.projects.map((project, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={project}
                onChange={(e) => updateProject(index, e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Project description"
                required
              />
              {formData.projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            + Add Project
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contact Information</label>
          <input
            type="email"
            placeholder="Email"
            value={formData.contact.email}
            onChange={(e) => setFormData({
              ...formData, 
              contact: {...formData.contact, email: e.target.value}
            })}
            className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={formData.contact.linkedin}
            onChange={(e) => setFormData({
              ...formData, 
              contact: {...formData.contact, linkedin: e.target.value}
            })}
            className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="GitHub URL"
            value={formData.contact.github}
            onChange={(e) => setFormData({
              ...formData, 
              contact: {...formData.contact, github: e.target.value}
            })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={status === 'generating'}
        >
          {status === 'generating' ? 'Generating...' : 'Generate Portfolio'}
        </button>
      </form>

      {status === 'completed' && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Generated Code</h2>
            <div className="space-x-4">
              <button
                onClick={downloadCode}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Download HTML
              </button>
              <button
                onClick={deployToS3}
                disabled={deploymentStatus === 'deploying'}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy to S3'}
              </button>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
          </div>
          
          {deploymentStatus === 'completed' && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
              <p>Successfully deployed! View your portfolio at:</p>
              <a 
                href={deployedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {deployedUrl}
              </a>
            </div>
          )}

          {deploymentStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              An error occurred while deploying to S3. Please try again.
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          An error occurred while generating your portfolio. Please try again.
        </div>
      )}
    </div>
  );
}