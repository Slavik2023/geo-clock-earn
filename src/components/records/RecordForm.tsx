
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RecordInput, createRecord, updateRecord, Record } from '@/services/recordService';

const recordSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.union([
    z.string().transform((val) => val === "" ? undefined : Number(val)),
    z.number().optional(),
    z.undefined(),
  ]),
  record_date: z.string().optional(),
});

interface RecordFormProps {
  record?: Record;
  onSuccess: () => void;
}

export function RecordForm({ record, onSuccess }: RecordFormProps) {
  const isEditing = !!record;
  
  const form = useForm<RecordInput>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      title: record?.title || "",
      description: record?.description || "",
      amount: record?.amount,
      record_date: record?.record_date ? new Date(record.record_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: RecordInput) => {
    try {
      if (isEditing && record) {
        await updateRecord(record.id, data);
      } else {
        await createRecord(data);
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Record" : "Create Record"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      {...field}
                      value={field.value === undefined ? "" : field.value} 
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional amount for this record
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="record_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">
                {isEditing ? "Update Record" : "Create Record"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
