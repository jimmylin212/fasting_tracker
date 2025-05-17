
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";

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
  onAddLog: (log: Omit<WorkoutLog, "id">) => void;
};

export function AddWorkoutLogForm({ onAddLog }: AddWorkoutLogFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      workoutType: "",
      weight: undefined,
      reps: undefined,
      sets: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddLog(values);
    form.reset({
      date: new Date(),
      workoutType: "",
      weight: undefined,
      reps: undefined,
      sets: undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg shadow-sm bg-card">
        <h3 className="text-lg font-semibold text-card-foreground">Add New Workout Entry</h3>
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
                    onSelect={field.onChange}
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
                  <Input type="number" step="0.1" placeholder="e.g., 50" {...field} />
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
                  <Input type="number" step="1" placeholder="e.g., 10" {...field} />
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
                  <Input type="number" step="1" placeholder="e.g., 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Workout Log
        </Button>
      </form>
    </Form>
  );
}
