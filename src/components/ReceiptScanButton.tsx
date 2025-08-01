import { useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReceiptScanning } from "@/hooks/useReceiptScanning";
import { Capacitor } from '@capacitor/core';

interface ReceiptScanButtonProps {
  onReceiptData?: (data: any) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ReceiptScanButton({ 
  onReceiptData, 
  disabled, 
  variant = "outline", 
  size = "default",
  className 
}: ReceiptScanButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isProcessing } = useReceiptScanning();
  const isNativePlatform = Capacitor.isNativePlatform();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Processing file:', file.name, file.type, file.size);
      
      const reader = new FileReader();
      reader.onload = async () => {
        const imageDataUrl = reader.result as string;
        if (!imageDataUrl) return;

        // Extract base64 data
        const base64Data = imageDataUrl.split(',')[1];

        // Call edge function to extract receipt data
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke('extract-receipt-data', {
          body: { image: base64Data }
        });

        if (error) {
          console.error('Receipt extraction error:', error);
          return;
        }

        console.log('Receipt data extracted:', data);
        onReceiptData?.(data.receiptData);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing receipt:', error);
    }

    // Reset input
    event.target.value = '';
  };

  const handleClick = () => {
    if (!isNativePlatform && fileInputRef.current) {
      // For WebView, use the visible file input
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        disabled={disabled || isProcessing}
        className={className}
      >
        <Camera className="h-4 w-4 mr-2" />
        {isProcessing ? "Scanning..." : "Scan Receipt"}
      </Button>
      
      {/* Visible file input for WebView compatibility */}
      {!isNativePlatform && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
}