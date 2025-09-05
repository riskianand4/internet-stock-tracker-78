import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Crown, ArrowRight } from 'lucide-react';
import { User as UserType } from '@/types/auth';
interface WelcomeCardProps {
  user: UserType;
  onStartTour: () => void;
}
const WelcomeCard: React.FC<WelcomeCardProps> = ({
  user,
  onStartTour
}) => {
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'user':
        return {
          icon: User,
          color: 'bg-blue-500',
          title: 'Staff User',
          description: 'View inventory, products, and generate reports',
          capabilities: ['View Products', 'Check Stock', 'Generate Reports', 'View Analytics']
        };
      case 'admin':
        return {
          icon: Shield,
          color: 'bg-green-500',
          title: 'Administrator',
          description: 'Manage inventory, products, and system operations',
          capabilities: ['All User Features', 'Add/Edit Products', 'Stock Management', 'User Reports', 'System Alerts']
        };
      case 'super_admin':
        return {
          icon: Crown,
          color: 'bg-purple-500',
          title: 'Super Administrator',
          description: 'Full system access and user management',
          capabilities: ['All Admin Features', 'User Management', 'System Settings', 'Advanced Analytics', 'Security Controls']
        };
      default:
        return {
          icon: User,
          color: 'bg-gray-500',
          title: 'User',
          description: 'Basic access',
          capabilities: []
        };
    }
  };
  const roleInfo = getRoleInfo(user.role);
  const IconComponent = roleInfo.icon;
  return <Card className="">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${roleInfo.color} text-white`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Welcome back, {user.name}!
              <Badge variant="secondary">{roleInfo.title}</Badge>
            </CardTitle>
            <CardDescription>{roleInfo.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Your Capabilities:</h4>
          <div className="flex flex-wrap gap-2">
            {roleInfo.capabilities.map(capability => <Badge key={capability} variant="outline" className="text-xs">
                {capability}
              </Badge>)}
          </div>
        </div>
        <Button onClick={onStartTour} className="w-full" variant="outline">
          <ArrowRight className="h-4 w-4 mr-2" />
          Take a Quick Tour
        </Button>
      </CardContent>
    </Card>;
};
export default WelcomeCard;