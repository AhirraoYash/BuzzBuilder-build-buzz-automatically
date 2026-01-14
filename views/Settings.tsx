
import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';

const SettingsInput: React.FC<{ label: string; type: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, type, id, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Settings: React.FC = () => {
  const [username, setUsername] = useState('john.doe@vaxtrack.com');
  const [password, setPassword] = useState('••••••••••••');
  const [apiKey, setApiKey] = useState('sk-••••••••••••••••••••••••••••••••••••••••');
  const [showToast, setShowToast] = useState(false);

  const handleSaveChanges = () => {
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 mb-6">
        <h2 className="text-xl font-semibold mb-1">LinkedIn Account</h2>
        <p className="text-white/50 text-sm mb-6">Connect your primary LinkedIn account for analysis and posting.</p>
        <div className="space-y-4">
          <SettingsInput label="Username" type="email" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <SettingsInput label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-1">AI API Keys</h2>
        <p className="text-white/50 text-sm mb-6">Enter your OpenAI API key for post generation.</p>
        <div className="space-y-4">
          <SettingsInput label="OpenAI API Key" type="password" id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
            onClick={handleSaveChanges}
            className="bg-white text-black font-semibold py-2 px-5 rounded-lg hover:bg-white/90 transition-colors"
        >
            Save Changes
        </button>
      </div>

      <Toast message="Changes saved successfully!" show={showToast} />
    </div>
  );
};

export default Settings;
