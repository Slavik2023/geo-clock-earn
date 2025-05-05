
import { Button } from "@/components/ui/button";

interface ManualAddressEntryProps {
  address: string;
  onAddressChange: (address: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ManualAddressEntry({ 
  address, 
  onAddressChange, 
  onConfirm, 
  onCancel 
}: ManualAddressEntryProps) {
  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
        placeholder="Enter address"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
      />
      <Button 
        size="sm" 
        onClick={onConfirm}
      >
        Confirm
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}
