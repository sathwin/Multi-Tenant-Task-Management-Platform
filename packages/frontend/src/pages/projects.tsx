import { motion } from 'framer-motion';
import { FolderOpen, Plus, Filter, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProjectsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="flex min-h-[400px] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Projects Coming Soon</h2>
          <p className="text-muted-foreground">
            Project management features are being developed
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
} 