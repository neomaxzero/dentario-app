"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type CollapsibleContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible components must be used inside Collapsible");
  }
  return context;
}

function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  asChild?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (value) => {
      const nextValue = typeof value === "function" ? value(open) : value;

      if (openProp === undefined) {
        setUncontrolledOpen(nextValue);
      }

      onOpenChange?.(nextValue);
    },
    [open, onOpenChange, openProp]
  );

  const Comp = asChild ? Slot : "div";

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <Comp
        data-state={open ? "open" : "closed"}
        className={cn(className)}
        {...props}
      >
        {children}
      </Comp>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({
  asChild,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, setOpen } = useCollapsibleContext();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-state={open ? "open" : "closed"}
      onClick={(event) => {
        onClick?.(event as never);
        setOpen((prev) => !prev);
      }}
      {...props}
    />
  );
}

function CollapsibleContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open } = useCollapsibleContext();

  if (!open) {
    return null;
  }

  return (
    <div data-state={open ? "open" : "closed"} className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
