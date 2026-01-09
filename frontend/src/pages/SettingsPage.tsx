import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { getBackendURL, setBackendURL } from '../lib/settings';

function SettingsPage() {
  const [backendUrl, setBackendUrlState] = useState(getBackendURL());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setBackendURL(backendUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Backend URL
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrlState(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1"
            />
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
          {saved && (
            <p className="text-green-600 text-sm mt-2 font-medium">✓ Settings saved! Reload the page to apply changes.</p>
          )}
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900 font-bold mb-2">📱 Mobile Setup Instructions:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Find your computer's IP address (e.g., 192.168.1.100)</li>
              <li>Enter: <code className="bg-blue-100 px-1 rounded">http://YOUR_IP:8000</code></li>
              <li>Example: <code className="bg-blue-100 px-1 rounded">http://192.168.178.23:8000</code></li>
              <li>Make sure both devices are on the same WiFi</li>
              <li>Click Save and reload the app</li>
            </ol>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Current: <code className="bg-gray-100 px-2 py-1 rounded">{backendUrl || 'Not configured'}</code>
          </p>
        </div>

        <div className="pt-4 border-t">
          <h2 className="text-xl font-semibold mb-2">About MangaWelt</h2>
          <p className="text-gray-600">
            MangaWelt is a manga collection management application.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

