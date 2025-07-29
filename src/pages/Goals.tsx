import { useState } from "react";
import { Plus, Target, Calendar, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useCreateGoalContribution } from "@/hooks/useGoals";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import goalsIcon from "@/assets/goals-icon.jpg";

export default function Goals() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const createContribution = useCreateGoalContribution();
  const { format: formatCurrency } = useCurrency();

  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    category: '',
  });

  const [contributionForm, setContributionForm] = useState({
    amount: '',
    notes: '',
  });

  const totalGoals = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      updateGoal.mutate({
        id: editingGoal.id,
        ...goalForm,
        target_amount: parseFloat(goalForm.target_amount),
      }, {
        onSuccess: () => {
          setGoalForm({ name: '', description: '', target_amount: '', target_date: '', category: '' });
          setShowGoalForm(false);
          setEditingGoal(null);
        },
      });
    } else {
      createGoal.mutate({
        ...goalForm,
        target_amount: parseFloat(goalForm.target_amount),
      }, {
        onSuccess: () => {
          setGoalForm({ name: '', description: '', target_amount: '', target_date: '', category: '' });
          setShowGoalForm(false);
        },
      });
    }
  };

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoalId) {
      toast({
        variant: "destructive",
        title: "Goal Required",
        description: "Please select a goal for the contribution.",
      });
      return;
    }

    createContribution.mutate({
      goalId: selectedGoalId,
      amount: parseFloat(contributionForm.amount),
      notes: contributionForm.notes,
    }, {
      onSuccess: () => {
        setContributionForm({ amount: '', notes: '' });
        setShowContributionForm(false);
        setSelectedGoalId('');
      },
    });
  };

  const handleEditGoal = (goal: any) => {
    setGoalForm({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount.toString(),
      target_date: goal.target_date || '',
      category: goal.category || '',
    });
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary/30">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Goals</h1>
              <p className="text-sm text-muted-foreground">Track your savings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowContributionForm(true)}
              variant="outline"
              size="sm"
              disabled={goals.length === 0}
              className="rounded-full w-8 h-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowGoalForm(true)} 
              size="sm"
              className="gradient-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 sm:px-6">

      {/* Add/Edit Goal Form */}
      {showGoalForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</CardTitle>
            <CardDescription>{editingGoal ? 'Update your savings goal' : 'Create a new savings goal'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Goal Name *</Label>
                  <Input
                    id="goal-name"
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-category">Category</Label>
                  <Input
                    id="goal-category"
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    placeholder="e.g., Safety Net"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount *</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    step="0.01"
                    value={goalForm.target_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-date">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={goalForm.target_date}
                    onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createGoal.isPending || updateGoal.isPending}>
                  {(createGoal.isPending || updateGoal.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingGoal ? (
                    <Edit2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowGoalForm(false);
                  setEditingGoal(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Contribution Form */}
      {showContributionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Contribution</CardTitle>
            <CardDescription>Record a contribution to one of your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContributionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Goal *</Label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select a goal</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={contributionForm.amount}
                    onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={contributionForm.notes}
                  onChange={(e) => setContributionForm({ ...contributionForm, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createContribution.isPending}>
                  {createContribution.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  Add Contribution
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowContributionForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Module illustration */}
      <div className="finance-card p-8 text-center">
        <img 
          src={goalsIcon} 
          alt="Savings Goals" 
          className="w-32 h-24 mx-auto rounded-lg object-cover mb-4"
        />
        <h3 className="text-lg font-semibold text-foreground">Goal Achievement</h3>
        <p className="text-muted-foreground mt-2">
          Turn your financial dreams into achievable, trackable goals.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Goals</h3>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalGoals)}</p>
          <p className="text-sm text-muted-foreground mt-1">Target amount</p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Saved</h3>
          <p className="text-3xl font-bold metric-positive">{formatCurrency(totalSaved)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {((totalSaved / totalGoals) * 100).toFixed(1)}% complete
          </p>
        </div>
        <div className="finance-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Average Progress</h3>
          <p className="text-3xl font-bold text-primary">
            {goals.length > 0 ? (((totalSaved / totalGoals) * 100).toFixed(1)) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Across all goals</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progressPercentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            
            return (
              <div key={goal.id} className="finance-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{goal.name}</h3>
                        <p className="text-muted-foreground">
                          {goal.category} {goal.target_date && `• Target: ${new Date(goal.target_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(Number(goal.current_amount))}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            of {formatCurrency(Number(goal.target_amount))}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this goal? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteGoal(goal.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">
                      {progressPercentage.toFixed(1)}% complete
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3"
                  />
                </div>

                {/* Goal details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {formatCurrency(Number(goal.target_amount) - Number(goal.current_amount))}
                      </p>
                      <p className="text-sm text-muted-foreground">Remaining to save</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No deadline'}
                      </p>
                      <p className="text-sm text-muted-foreground">Target date</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No goals yet</p>
            <Button onClick={() => setShowGoalForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}