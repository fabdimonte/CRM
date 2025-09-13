import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ndasApi } from '@/services/documents-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Shield, FileText, Calendar } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { NDA } from '@/types'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  signed: 'bg-green-100 text-green-800 border-green-200',
}

const counterpartyLabels = {
  buyer: 'Buyer',
  seller: 'Seller',
  target: 'Target',
}

export function NDAs() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: ndasData, isLoading } = useQuery({
    queryKey: ['ndas', { search, status: statusFilter }],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      return ndasApi.getNDAs(Object.keys(params).length > 0 ? params : undefined)
    },
  })

  const ndas = ndasData?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NDAs</h1>
          <p className="text-muted-foreground">
            Track Non-Disclosure Agreements across your deals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add NDA
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search NDAs..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : ndas.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No NDAs found</h3>
              <p className="text-muted-foreground">
                {search || statusFilter ? 'Try adjusting your filters.' : 'Start by adding your first NDA.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ndas.map((nda: NDA) => (
            <Card key={nda.id} className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{nda.deal_title}</CardTitle>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${statusColors[nda.status]}`}
                    >
                      {nda.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {counterpartyLabels[nda.counterparty]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {nda.signed_at && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Signed {formatDateTime(nda.signed_at)}</span>
                  </div>
                )}

                {nda.file_details && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="truncate">{nda.file_details.filename}</span>
                  </div>
                )}

                {nda.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {nda.notes}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  Created {formatDateTime(nda.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}