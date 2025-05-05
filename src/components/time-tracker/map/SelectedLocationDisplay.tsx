
import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedLocationDisplayProps {
  address: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  onConfirm: () => void;
}

export function SelectedLocationDisplay({ address, street, city, state, zipCode, onConfirm }: SelectedLocationDisplayProps) {
  return (
    <div className="p-3 border rounded-md bg-blue-50">
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Selected Location</p>
          <p className="text-xs text-gray-600 break-words">{address}</p>
          
          {(street || city || state || zipCode) && (
            <div className="mt-2 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {street && (
                  <>
                    <span className="font-medium">Street:</span>
                    <span>{street}</span>
                  </>
                )}
                
                {city && (
                  <>
                    <span className="font-medium">City:</span>
                    <span>{city}</span>
                  </>
                )}
                
                {state && (
                  <>
                    <span className="font-medium">State/Region:</span>
                    <span>{state}</span>
                  </>
                )}
                
                {zipCode && (
                  <>
                    <span className="font-medium">ZIP/Postal Code:</span>
                    <span>{zipCode}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <Button onClick={onConfirm} variant="outline" size="sm" className="h-8 flex-shrink-0">
          <Check className="h-3 w-3 mr-1" />
          Use This
        </Button>
      </div>
    </div>
  );
}
