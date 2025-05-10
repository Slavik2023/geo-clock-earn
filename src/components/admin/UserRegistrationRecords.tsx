
import React, { useState, useEffect } from 'react';
import { fetchUserRegistrationRecords, Record } from '@/services/recordService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ConnectionErrorBanner } from '@/components/time-tracker/ConnectionErrorBanner';

export function UserRegistrationRecords() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrationRecords = async () => {
    try {
      console.log("Loading registration records...");
      setLoading(true);
      setError(null);
      const data = await fetchUserRegistrationRecords();
      console.log("Records loaded:", data);
      setRecords(data);
    } catch (err: any) {
      console.error("Error loading registration records:", err);
      setError(err?.message || "Failed to load registration records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrationRecords();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Registrations</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadRegistrationRecords}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading registration records...</div>
        ) : error ? (
          <div className="text-center py-4">
            <ConnectionErrorBanner 
              message={error} 
              onRetry={loadRegistrationRecords} 
              variant="error"
            />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <AlertCircle className="mx-auto h-8 w-8 mb-2 text-gray-400" />
            <p>No user registration records found.</p>
            <p className="text-sm text-gray-400 mt-1">New registrations will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>
                    {record.created_at ? format(new Date(record.created_at), 'MMM d, yyyy HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
