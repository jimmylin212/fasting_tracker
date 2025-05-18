
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Save } from "lucide-react"; // Added Save icon

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { WorkoutLog } from "@/lib/types";

const formSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  workoutType: z.string().min(1, "Workout type is required."),
  weight: z.coerce.number().min(0, "Weight must be 0 or a positive number."),
  reps: z.coerce.number().int().min(1, "Reps must be a positive integer."),
  sets: z.coerce.number().int().min(1, "Sets must be a positive integer."),
});

type AddWorkoutLogFormProps = {
  onSaveLog: (log: Omit<WorkoutLog, "id"> | WorkoutLog) => void; // Modified to accept full log for updates
  logToEdit: WorkoutLog | null;
  onCancelEdit: () => void; // Added to allow canceling an edit
};

const defaultFormValues = {
  date: new Date(),
  workoutType: "",
  weight: "" as unknown as number,
  reps: "" as unknown as number,
  sets: "" as unknown as number,
};

export function AddWorkoutLogForm({ onSaveLog, logToEdit, onCancelEdit }: AddWorkoutLogFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  React.useEffect(() => {
    if (logToEdit) {
      form.reset({
        date: new Date(logToEdit.date), // Ensure date is a new Date object
        workoutType: logToEdit.workoutType,
        weight: logToEdit.weight,
        reps: logToEdit.reps,
        sets: logToEdit.sets,
      });
    } else {
      form.reset(defaultFormValues);
    }
  }, [logToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (logToEdit) {
      onSaveLog({ ...logToEdit, ...values }); // Pass the full log with ID for update
    } else {
      onSaveLog(values); // Pass new log data
    }
    // Resetting to default is handled by parent setting logToEdit to null, which triggers useEffect
  }
  
  const isEditing = !!logToEdit;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg shadow-sm bg-card">
        <h3 className="text-lg font-semibold text-card-foreground">{isEditing ? "Edit Workout Entry" : "Add New Workout Entry"}</h3>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal md:w-auto",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date || new Date())}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workoutType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workout Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Bench Press, Squat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (KG)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 50" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps (per set)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 10" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sets</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 3" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-2">
            <Button type="submit" className="w-full md:w-auto">
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isEditing ? "Update Workout Log" : "Add Workout Log"}
            </Button>
            {isEditing && (
            <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full md:w-auto">
                Cancel Edit
            </Button>
            )}
        </div>
      </form>
    </Form>
  );
}
