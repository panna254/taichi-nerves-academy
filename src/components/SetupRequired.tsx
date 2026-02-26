import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Settings } from "lucide-react";

export const SetupRequired = () => {
  const handleSetupGuide = () => {
    window.open('/SUPABASE_INTEGRATION_GUIDE.md', '_blank');
  };

  const handleSetupScript = () => {
    console.log('Running setup script...');
    // In a real app, this would trigger the setup script
    alert('Run: npm run setup:supabase in your terminal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-orange-900">Setup Required</CardTitle>
            <CardDescription className="text-orange-700">
              Supabase backend needs to be configured to run this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/50 p-3 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2">Quick Steps:</h4>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>Create a Supabase project</li>
                <li>Copy your Project URL & anon key</li>
                <li>Add them to your .env file</li>
                <li>Restart the development server</li>
              </ol>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSetupGuide} 
                className="w-full gap-2"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4" />
                View Setup Guide
              </Button>
              
              <Button 
                onClick={handleSetupScript} 
                className="w-full gap-2"
              >
                <Settings className="w-4 h-4" />
                Run Setup Helper
              </Button>
            </div>
            
            <div className="text-xs text-orange-600 text-center">
              <p>Check browser console (F12) for detailed debugging info</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
