
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface PersonalDetailsProps {
  name: string;
  setName: (name: string) => void;
  email?: string;
  bio?: string;
  setBio?: (bio: string) => void;
}

export function PersonalDetails({ name, setName, email, bio, setBio }: PersonalDetailsProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
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
        
        {email && (
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              value={email} 
              readOnly
              className="w-full bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Your email address is used for login and notifications.
            </p>
          </div>
        )}
        
        {bio !== undefined && setBio && (
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell us about yourself"
              className="w-full resize-none min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              A brief description about yourself that will be visible to other team members.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
