
import React, { useState, useEffect } from 'react';
import { fetchRecords, deleteRecord, Record } from '@/services/recordService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/App';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface RecordsListProps {
  onEdit: (record: Record) => void;
}

export function RecordsList({ onEdit }: RecordsListProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchRecords();
      setRecords(data);
    } catch (error) {
      console.error("Error loading records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading records...</div>;
  }

  if (records.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            No records found. Create your first record!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.title}</TableCell>
                <TableCell>{record.amount !== null ? `$${record.amount}` : '-'}</TableCell>
                <TableCell>
                  {record.record_date ? format(new Date(record.record_date), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(record)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(record.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
