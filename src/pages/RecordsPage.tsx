
import React, { useState } from 'react';
import { RecordsList } from '@/components/records/RecordsList';
import { RecordForm } from '@/components/records/RecordForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Record } from '@/services/recordService';
import { useAuth } from '@/App';
import { Navigate } from 'react-router-dom';

export function RecordsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | undefined>(undefined);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const handleEdit = (record: Record) => {
    setSelectedRecord(record);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedRecord(undefined);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Records</h1>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Record
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => {
            setShowForm(false);
            setSelectedRecord(undefined);
          }}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className={showForm ? "md:col-span-1" : "md:col-span-2"}>
          <RecordsList onEdit={handleEdit} />
        </div>
        {showForm && (
          <div className="md:col-span-1">
            <RecordForm record={selectedRecord} onSuccess={handleFormSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}
