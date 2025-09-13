import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { interactionsApi } from '@/services/interactions-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InteractionsList } from '@/components/interactions/InteractionsList'
import { Plus, Search } from 'lucide-react'

export function Interactions() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data: interactionsData, isLoading } = useQuery({
    queryKey: ['interactions', { search, type: typeFilter }],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      return interactionsApi.getInteractions(Object.keys(params).length > 0 ? params : undefined)
    },
  })

  const interactions = interactionsData?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactions</h1>
          <p className="text-muted-foreground">
            Track all communications and notes across deals and contacts
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Interaction
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="call">Phone Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : (
        <InteractionsList interactions={interactions} />
      )}
    </div>
  )
}