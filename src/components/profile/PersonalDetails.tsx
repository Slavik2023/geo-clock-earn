
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface PersonalDetailsProps {
  name: string;
  setName: (name: string) => void;
}

export function PersonalDetails({ name, setName }: PersonalDetailsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            This is the name that will be displayed to other users.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
