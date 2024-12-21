'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

export default function HomeServiceForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    serviceType: 'electrical',
    about: '',
    services: [''],
    coverage: '',
    experience: '',
    testimonials: [''],
    pricing: [''],
    contact: {
      phone: '',
      email: '',
      address: ''
    },
    workingHours: '',
    emergency: false,
    colors: '',
    guarantees: '',
    licenses: ''
  });

  const [status, setStatus] = useState('idle');
  const [generatedCode, setGeneratedCode] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [deployedUrl, setDeployedUrl] = useState('');

  const serviceTypeOptions = {
    electrical: {
      title: 'Electrical Services',
      placeholders: {
        services: 'e.g., Electrical Repairs, Wiring Installation',
        pricing: 'e.g., Basic Inspection: $99, Full Rewiring: Starting at $500'
      }
    },
    plumbing: {
      title: 'Plumbing Services',
      placeholders: {
        services: 'e.g., Pipe Repairs, Drain Cleaning',
        pricing: 'e.g., Drain Clearing: $150, Faucet Installation: $200'
      }
    },
    cleaning: {
      title: 'Cleaning Services',
      placeholders: {
        services: 'e.g., Deep Cleaning, Window Washing',
        pricing: 'e.g., Basic Clean: $100, Deep Clean: $250'
      }
    },
    maid: {
      title: 'Maid Services',
      placeholders: {
        services: 'e.g., Regular Cleaning, Laundry Service',
        pricing: 'e.g., 2-Hour Service: $80, Full Day: $300'
      }
    }
  };

  const addListItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateListItem = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newList
    }));
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
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
      const folderName = `${formData.businessName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

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


  const renderFormSection = (field, label, placeholder, type = 'text', rows = 1) => (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="space-y-2"
    >
      <label className="block text-sm font-medium mb-2">{label}</label>
      {rows > 1 ? (
        <textarea
          value={formData[field]}
          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          rows={rows}
          required
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          required
          placeholder={placeholder}
        />
      )}
    </motion.div>
  );

  const renderListSection = (field, label, placeholder) => (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-2"
    >
      <label className="block text-sm font-medium mb-2">{label}</label>
      {formData[field].map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateListItem(field, index, e.target.value)}
            className="flex-1 p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            required
          />
          {formData[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem(field, index)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addListItem(field)}
        className="text-sm text-blue-400 hover:text-blue-500"
      >
        + Add {label.split(' ')[0]}
      </button>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-3xl font-bold text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Home Service Business Website Generator
        </motion.h1>

        <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-black shadow-2xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormSection('businessName', 'Business Name', 'e.g., Elite Electrical Services')}

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.entries(serviceTypeOptions).map(([value, { title }]) => (
                  <option key={value} value={value}>{title}</option>
                ))}
              </select>
            </motion.div>

            {renderFormSection('about', 'About Your Business', 'Tell us about your business history, mission, and values...', 'text', 4)}
            {renderFormSection('experience', 'Years of Experience', 'e.g., 15', 'number')}
            {renderFormSection('coverage', 'Service Area Coverage', 'e.g., Greater Toronto Area, Within 50km of downtown')}
            {renderListSection('services', 'Services Offered', serviceTypeOptions[formData.serviceType].placeholders.services)}
            {renderListSection('pricing', 'Pricing Information', serviceTypeOptions[formData.serviceType].placeholders.pricing)}
            {renderFormSection('workingHours', 'Working Hours', 'e.g., Mon-Fri: 8AM-6PM, Sat: 9AM-2PM')}
            {renderFormSection('licenses', 'Licenses & Certifications', 'e.g., Licensed Master Electrician, Certified Plumber')}
            {renderFormSection('guarantees', 'Service Guarantees', 'e.g., 100% Satisfaction Guarantee, 90-Day Warranty')}

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={formData.emergency}
                onChange={(e) => setFormData({...formData, emergency: e.target.checked})}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-sm font-medium">Offer Emergency Services</span>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium mb-2">Contact Information</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: {...formData.contact, phone: e.target.value}
                    })}
                    className="flex-1 p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: {...formData.contact, email: e.target.value}
                    })}
                    className="flex-1 p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Business Address"
                    value={formData.contact.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: {...formData.contact, address: e.target.value}
                    })}
                    className="flex-1 p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {renderListSection('testimonials', 'Client Testimonials', 'Share what your clients are saying about your service...')}
            {renderFormSection('colors', 'Color Scheme Preference', 'e.g., Blue and White, Professional Dark Theme')}

            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center space-x-2"
              disabled={status === 'generating'}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              {status === 'generating' ? (
                <>
                  <span className="animate-spin">⌛</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Generate Website</span>
                </>
              )}
            </motion.button>
          </form>

          {status === 'completed' && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Generated Website Code</h2>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedCode], { type: 'text/html;charset=utf-8' });
                      saveAs(blob, 'index.html');
                    }}
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
              <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto">
                <pre>
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </motion.div>
          )}

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

          {status === 'error' && (
            <motion.div
              className="mt-4 p-4 bg-red-900 text-red-300 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              An error occurred while generating your website. Please try again.
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}