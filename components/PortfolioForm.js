'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';

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
      const folderName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: generatedCode, folderName: folderName }),
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
    saveAs(blob, 'index.html');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-black shadow-2xl rounded-lg p-8 max-w-4xl w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2">Professional Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., Full Stack Developer"
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2">About Me</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </motion.div>


          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-lg font-semibold mb-2">Color Pallete</label>
            <input
            type="text"
            value={formData.colors}
            onChange={(e) => setFormData({...formData,colors:e.target.value})}
            placeholder="Your color palette for website"
            className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            required
            />
            </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2">Projects</label>
            {formData.projects.map((project, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={project}
                  onChange={(e) => updateProject(index, e.target.value)}
                  className="flex-1 p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Project description"
                  required
                />
                {formData.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="text-sm text-blue-400 hover:text-blue-500"
            >
              + Add Project
            </button>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2">Contact Information</label>
            <input
              type="email"
              placeholder="Email"
              value={formData.contact.email}
              onChange={(e) => setFormData({
                ...formData, 
                contact: {...formData.contact, email: e.target.value}
              })}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded mb-2 focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded mb-2 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="GitHub URL"
              value={formData.contact.github}
              onChange={(e) => setFormData({
                ...formData, 
                contact: {...formData.contact, github: e.target.value}
              })}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>

          <motion.button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-500"
            disabled={status === 'generating'}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {status === 'generating' ? 'Generating...' : 'Generate Portfolio'}
          </motion.button>
        </form>

        {status === 'completed' && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated Code</h2>
              <div className="space-x-4">
                <button
                  onClick={downloadCode}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Download HTML
                </button>
                <button
                  onClick={deployToS3}
                  disabled={deploymentStatus === 'deploying'}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-500"
                >
                  {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy to S3'}
                </button>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto">
                <code>{generatedCode}</code>
              </pre>
            </div>

            {deploymentStatus === 'completed' && (
              <div className="mt-4 p-4 bg-green-900 text-green-300 rounded">
                <p>Successfully deployed! View your portfolio at:</p>
                <a 
                  href={deployedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {deployedUrl}
                </a>
              </div>
            )}

            {deploymentStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-900 text-red-300 rounded">
                An error occurred while deploying to S3. Please try again.
              </div>
            )}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            className="mt-4 p-4 bg-red-900 text-red-300 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            An error occurred while generating your portfolio. Please try again.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}