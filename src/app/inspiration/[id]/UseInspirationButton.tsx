"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Inspiration } from "@/types/inspiration";

interface UseInspirationButtonProps {
  inspiration: Inspiration;
}

export default function UseInspirationButton({ inspiration }: UseInspirationButtonProps) {
  // const { loadInspiration } = useGift();
  const router = useRouter();

  const handleUse = () => {
    // TODO: dispatch(loadInspiration(inspiration))
    // TODO: Use inspiration data to pre-populate gift builder
    console.log('Using inspiration:', inspiration.id);
    router.push("/gift");
  };

  return (
    <div className="mt-4">
      <Button
        size="lg"
        className="text-sm bg-purple-600 hover:bg-purple-700 w-full"
        onClick={handleUse}
      >
        <Copy className="w-3 h-3 mr-1" />
         تعديل هذه الهدية
      </Button>
    </div>
  );
}
