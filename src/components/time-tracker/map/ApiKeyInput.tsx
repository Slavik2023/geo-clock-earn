
import { Button } from "@/components/ui/button";

interface ApiKeyInputProps {
  onLoadMap: () => void;
}

export function ApiKeyInput({ onLoadMap }: ApiKeyInputProps) {
  return (
    <div className="p-4 border rounded-md bg-green-50">
      <h3 className="text-sm font-semibold mb-2">Free Location Service</h3>
      <p className="text-xs mb-3">
        We've updated to a free location service. No API key required!
      </p>
      <div className="flex gap-2">
        <Button 
          onClick={onLoadMap}
          size="sm"
          className="w-full"
        >
          Start Location Service
        </Button>
      </div>
    </div>
  );
}
