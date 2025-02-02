'use client';

import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useResume } from '@/app/context/resumecontext';
import { generateResumeContent } from "@/lib/gemini";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function AIAssistButton({ onGenerate }: { onGenerate: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await generateResumeContent('personalInfo', prompt);
      if (content) {
        onGenerate(content);
        setIsOpen(false);
        setPrompt('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="group relative bg-gradient-to-br from-gray-800 hover:from-emerald-600 to-gray-900 hover:to-emerald-700 transition-all duration-300 overflow-hidden"
        >
          <motion.span 
            className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <Wand2 className="group-hover:text-white mr-2 w-4 h-4 transition-colors" />
          <span className="group-hover:text-white relative z-10">AI Assist</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-emerald-500" />
              <h4 className="font-medium">AI Resume Assistant</h4>
            </div>
            
            <Textarea
              placeholder="Describe your experience or paste your existing resume content here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-gray-800 focus:border-emerald-500/50 bg-gray-950 min-h-[150px] transition-colors"
            />
            
            <Button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="bg-gradient-to-r from-emerald-600 hover:from-emerald-500 to-emerald-500 hover:to-emerald-400 w-full transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
            
            <p className="text-center text-gray-400 text-xs">
              Powered by AI to help you create professional resume content
            </p>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

