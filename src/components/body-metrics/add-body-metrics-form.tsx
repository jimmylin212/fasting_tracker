
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
import type { BodyMetricsLog } from "@/lib/types";

const formSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  weight: z.coerce.number().positive("Weight must be a positive number."),
  fatPercentage: z.coerce.number().min(1, "Fat % must be at least 1.").max(70, "Fat % cannot exceed 70.").optional().or(z.literal("")),
  skeletalMuscleMassPercentage: z.coerce.number().min(1, "SMM % must be at least 1.").max(70, "SMM % cannot exceed 70.").optional().or(z.literal("")),
});

type AddBodyMetricsFormProps = {
  onAddLog: (log: Omit<BodyMetricsLog, "id" | "fatPercentage" | "skeletalMuscleMassPercentage"> & { fatPercentage?: number, skeletalMuscleMassPercentage?: number }) => void;
};

export function AddBodyMetricsForm({ onAddLog }: AddBodyMetricsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      weight: "" as unknown as number,
      fatPercentage: "" as unknown as number,
      skeletalMuscleMassPercentage: "" as unknown as number,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const logData: Omit<BodyMetricsLog, "id" | "fatPercentage" | "skeletalMuscleMassPercentage"> & { fatPercentage?: number, skeletalMuscleMassPercentage?: number } = {
        date: values.date,
        weight: values.weight,
    };
    if (values.fatPercentage !== "" && values.fatPercentage !== undefined) {
        logData.fatPercentage = typeof values.fatPercentage === 'string' ? parseFloat(values.fatPercentage) : values.fatPercentage;
    }
    if (values.skeletalMuscleMassPercentage !== "" && values.skeletalMuscleMassPercentage !== undefined) {
        logData.skeletalMuscleMassPercentage = typeof values.skeletalMuscleMassPercentage === 'string' ? parseFloat(values.skeletalMuscleMassPercentage) : values.skeletalMuscleMassPercentage;
    }
    onAddLog(logData);
    form.reset({
      date: new Date(),
      weight: "" as unknown as number,
      fatPercentage: "" as unknown as number,
      skeletalMuscleMassPercentage: "" as unknown as number,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg shadow-sm bg-card">
        <h3 className="text-lg font-semibold text-card-foreground">Log New Body Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                            "w-full pl-3 text-left font-normal",
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
            <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 70.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="fatPercentage"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Body Fat % (Optional)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 15.2" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="skeletalMuscleMassPercentage"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Skeletal Muscle Mass % (Optional)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 35.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <Button type="submit" variant="accent" className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Body Metrics Log
        </Button>
      </form>
    </Form>
  );
}
