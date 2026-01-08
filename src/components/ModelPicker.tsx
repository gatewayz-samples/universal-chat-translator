'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Sparkles, Check } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  top_provider?: {
    name?: string;
  };
}

interface ModelPickerProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  triggerText?: string;
}

export function ModelPicker({ selectedModel, onModelSelect, triggerText = 'Select Model' }: ModelPickerProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && models.length === 0) {
      fetchModels();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredModels(models);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = models.filter(
        (model) =>
          model.id?.toLowerCase().includes(query) ||
model.name?.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query)
      );
      setFilteredModels(filtered);
    }
  }, [searchQuery, models]);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/models?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();

      // Handle different response formats
      let modelsList: Model[] = [];
      if (Array.isArray(data)) {
        modelsList = data;
      } else if (data.data && Array.isArray(data.data)) {
        modelsList = data.data;
      } else if (data.models && Array.isArray(data.models)) {
        modelsList = data.models;
      }

      setModels(modelsList);
      setFilteredModels(modelsList);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
      setFilteredModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setOpen(false);
  };

  const getSelectedModelName = () => {
    const model = models.find((m) => m.id === selectedModel);
    return model?.name || model?.id || selectedModel;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {selectedModel ? getSelectedModelName() : triggerText}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Select AI Model</DialogTitle>
          <DialogDescription>
            Choose froma wide range of AI models for your translation needs
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[500px] px-6 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
              <p className="text-sm text-gray-500">Loading models...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-gray-500 mb-2">
                {searchQuery ? 'No models found matching your search' : 'No models available'}
              </p>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model) => (
                <Card
                  key={model.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedModel === model.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => handleModelSelect(model.id)}
                >
<CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold line-clamp-2 flex-1">
                        {model.name || model.id}
                      </CardTitle>
                      {selectedModel === model.id && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <CardDescription className="text-xs line-clamp-1">
                      {model.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {model.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {model.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {model.top_provider?.name && (
                        <Badge variant="secondary" className="text-xs">
                          {model.top_provider.name}
                        </Badge>
                      )}
                      {model.context_length && (
                        <Badge variant="outline" className="text-xs">
                          {model.context_length.toLocaleString()} ctx
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
