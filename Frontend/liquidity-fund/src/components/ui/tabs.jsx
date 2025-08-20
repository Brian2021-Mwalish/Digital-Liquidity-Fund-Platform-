import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

// Root container
const Tabs = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={className} {...props} />
));
Tabs.displayName = "Tabs";

// Tabs List (the row of triggers)
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`flex space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 ${className}`}
    {...props}
  />
));
TabsList.displayName = "TabsList";

// Each Trigger (tab button)
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
      data-[state=active]:bg-blue-600 data-[state=active]:text-white
      data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600
      hover:bg-blue-100 dark:hover:bg-gray-700 ${className}`}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// Content (what shows when tab is active)
const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-4 rounded-lg border p-4 bg-white dark:bg-gray-900 ${className}`}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
