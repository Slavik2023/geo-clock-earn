
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onLoadMap: () => void;
}

export function ApiKeyInput({ apiKey, onApiKeyChange, onLoadMap }: ApiKeyInputProps) {
  return (
    <div className="p-4 border rounded-md bg-yellow-50">
      <h3 className="text-sm font-semibold mb-2">Google Maps API Key Required</h3>
      <p className="text-xs mb-3">
        To use the location map, please enter your Google Maps API key.
      </p>
      <div className="flex gap-2">
        <Input
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Enter Google Maps API Key"
          className="text-sm"
        />
        <Button 
          onClick={onLoadMap} 
          disabled={!apiKey}
          size="sm"
        >
          Load Map
        </Button>
      </div>
    </div>
  );
}
