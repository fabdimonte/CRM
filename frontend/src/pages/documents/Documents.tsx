import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { documentsApi } from '@/services/documents-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DocumentsList } from '@/components/documents/DocumentsList'
import { Plus, Search, Upload } from 'lucide-react'

export function Documents() {
  const [search, setSearch] = useState('')

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['documents', { search }],
    queryFn: () => documentsApi.getDocuments(search ? { search } : undefined),
  })

  const documents = documentsData?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and organize deal-related documents and files
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : (
        <DocumentsList documents={documents} />
      )}
    </div>
  )
}