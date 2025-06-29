"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserCheck, UserX } from 'lucide-react';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setShowResult(true);
  };

  const resetForm = () => {
    setSelectedGender('');
    setShowResult(false);
    setIsOpen(false);
  };

  const getResultMessage = () => {
    if (selectedGender === 'female') {
      return {
        text: 'Access Granted',
        icon: <UserCheck className="w-8 h-8 text-green-500" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        text: 'No Access',
        icon: <UserX className="w-8 h-8 text-red-500" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Identity Verification
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Click the button below to begin the verification process
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  Verify
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-center">
                    Gender Verification
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {!showResult ? (
                    <div className="space-y-4">
                      <p className="text-gray-600 text-center">
                        Please select your gender to continue
                      </p>
                      <Select onValueChange={handleGenderSelect}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-lg border-2 ${getResultMessage().bgColor} ${getResultMessage().borderColor} text-center`}>
                        <div className="flex justify-center mb-3">
                          {getResultMessage().icon}
                        </div>
                        <h3 className={`text-xl font-bold ${getResultMessage().textColor}`}>
                          {getResultMessage().text}
                        </h3>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={resetForm}
                          className="flex-1"
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={() => setIsOpen(false)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Secure • Private • Instant Verification
          </p>
        </div>
      </div>
    </div>
  );
}