import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/services/tasks-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TasksList } from '@/components/tasks/TasksList'
import { Plus, Search } from 'lucide-react'

export function Tasks() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { search, status: statusFilter }],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      return tasksApi.getTasks(Object.keys(params).length > 0 ? params : undefined)
    },
  })

  const tasks = tasksData?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage action items and track progress across deals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="doing">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : (
        <TasksList tasks={tasks} />
      )}
    </div>
  )
}