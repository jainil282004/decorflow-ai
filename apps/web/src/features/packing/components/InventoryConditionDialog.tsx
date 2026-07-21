import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { ReceiveReturnDTO } from '@decorflow/shared';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
  onProcessReturn: (data: ReceiveReturnDTO) => void;
}

export const InventoryConditionDialog = ({ open, onOpenChange, job, onProcessReturn }: Props) => {
  const [returnItems, setReturnItems] = useState<any[]>(
    job.items.map((i: any) => ({
      id: i.id,
      expected: i.pickedQuantity,
      returnedQuantity: i.pickedQuantity,
      returnMissingQuantity: 0,
      returnDamagedQuantity: 0,
      needsCleaningQuantity: 0,
      needsRepairQuantity: 0,
      returnNotes: '',
    }))
  );

  const handleItemChange = (index: number, field: string, value: number | string) => {
    const newItems = [...returnItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate returned quantity based on missing/damaged
    if (
      typeof value === 'number' &&
      ['returnMissingQuantity', 'returnDamagedQuantity'].includes(field)
    ) {
      const expected = newItems[index].expected;
      const missing = Number(newItems[index].returnMissingQuantity) || 0;
      const damaged = Number(newItems[index].returnDamagedQuantity) || 0;
      newItems[index].returnedQuantity = Math.max(0, expected - missing - damaged);
    }

    setReturnItems(newItems);
  };

  const handleSubmit = () => {
    onProcessReturn({
      returnNotes: 'Processed via returns dialog',
      items: returnItems.map((item) => ({
        id: item.id,
        returnedQuantity: Number(item.returnedQuantity),
        returnMissingQuantity: Number(item.returnMissingQuantity),
        returnDamagedQuantity: Number(item.returnDamagedQuantity),
        needsCleaningQuantity: Number(item.needsCleaningQuantity),
        needsRepairQuantity: Number(item.needsRepairQuantity),
        returnNotes: item.returnNotes,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Process Returns</DialogTitle>
          <DialogDescription>
            Record the condition of returned items. Report missing, damaged, or items requiring
            maintenance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {job.items.map((item: any, index: number) => (
            <div
              key={item.id}
              className="p-4 border border-border rounded-xl space-y-4 bg-muted/20"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="font-medium">{item.variant?.name || 'Unknown Item'}</span>
                <span className="text-sm text-muted-foreground">
                  Dispatched: {item.pickedQuantity}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Returned (Good)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={returnItems[index].returnedQuantity}
                    onChange={(e) =>
                      handleItemChange(index, 'returnedQuantity', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Missing
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={returnItems[index].returnMissingQuantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'returnMissingQuantity',
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Damaged
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={returnItems[index].returnDamagedQuantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'returnDamagedQuantity',
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Needs Cleaning
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={returnItems[index].needsCleaningQuantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'needsCleaningQuantity',
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Needs Repair
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={returnItems[index].needsRepairQuantity}
                    onChange={(e) =>
                      handleItemChange(index, 'needsRepairQuantity', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Notes
                </Label>
                <Input
                  placeholder="Optional notes about condition..."
                  value={returnItems[index].returnNotes}
                  onChange={(e) => handleItemChange(index, 'returnNotes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Complete Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
