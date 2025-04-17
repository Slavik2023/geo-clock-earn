
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalDetailsProps {
  name: string;
  setName: (name: string) => void;
}

export function PersonalDetails({ name, setName }: PersonalDetailsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Display Name</Label>
      <Input 
        id="name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Your name"
      />
    </div>
  );
}
