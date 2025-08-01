import { useState } from "react";
import { Camera, Receipt, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { captureReceipt, hapticFeedback, isMobile } from "@/utils/mobile";
import { useToast } from "@/hooks/use-toast";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useVoiceTransactionParser } from "@/hooks/useVoiceTransactionParser";

interface TransactionFormProps {
  type: "income" | "expense";
  onSubmit: (transaction: any) => void;
}

export function TransactionForm({ type, onSubmit }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    receipt: null as string | null
  });
  const { toast } = useToast();
  const { parseTransactionFromText } = useVoiceTransactionParser();

  const categories = type === "income" 
    ? ["Salary", "Freelance", "Investment", "Business", "Other"]
    : ["Food", "Housing", "Transportation", "Entertainment", "Utilities", "Healthcare", "Shopping", "Other"];

  const handleVoiceTranscription = async (text: string) => {
    try {
      await hapticFeedback('light');
      
      // Parse the transcribed text to extract transaction details
      const parsedData = await parseTransactionFromText(text);
      
      // Update form with parsed data
      setFormData(prev => ({
        ...prev,
        amount: parsedData.amount ? parsedData.amount.toString() : prev.amount,
        description: parsedData.description || prev.description,
        category: parsedData.category || prev.category,
      }));
      
      toast({
        title: "Voice input processed",
        description: "Transaction details extracted from voice",
      });
    } catch (error) {
      console.error('Error processing voice input:', error);
    }
  };

  const handlePhotoCapture = async () => {
    await hapticFeedback('light');
    const photo = await captureReceipt();
    if (photo) {
      setFormData(prev => ({ ...prev, receipt: photo }));
      toast({
        title: "Receipt captured",
        description: "Photo attached to transaction",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await hapticFeedback('medium');
    
    const transaction = {
      ...formData,
      amount: parseFloat(formData.amount),
      type,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    onSubmit(transaction);
    setFormData({
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      receipt: null
    });
    setOpen(false);
    
    toast({
      title: "Transaction added",
      description: `${type === 'income' ? 'Income' : 'Expense'} of $${formData.amount} recorded`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`gradient-primary w-full ${isMobile() ? 'h-12' : ''}`}
          onClick={() => hapticFeedback('light')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {type === 'income' ? 'Income' : 'Expense'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {type === 'income' ? 'Income' : 'Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="flex gap-2">
              <Input
                id="description"
                placeholder="Enter description or use voice"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="flex-1"
              />
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isMobile() && (
            <div className="space-y-2">
              <Label>Receipt</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePhotoCapture}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {formData.receipt ? "Change Photo" : "Take Photo"}
                </Button>
                {formData.receipt && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, receipt: null }));
                      hapticFeedback('light');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.receipt && (
                <div className="mt-2">
                  <img 
                    src={formData.receipt} 
                    alt="Receipt" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary"
              disabled={!formData.amount || !formData.description || !formData.category}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}