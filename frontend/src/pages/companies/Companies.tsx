import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { companiesApi } from '@/services/companies-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Building, MapPin, Globe, Users } from 'lucide-react'
import type { Company } from '@/types'

export function Companies() {
  const [search, setSearch] = useState('')

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies', { search }],
    queryFn: () => companiesApi.getCompanies(search ? { search } : undefined),
  })

  const companies = companiesData?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your target companies and prospects
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
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
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No companies found</h3>
              <p className="text-muted-foreground">
                {search ? 'Try adjusting your search terms.' : 'Start by adding your first company.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company: Company) => (
            <Card key={company.id} className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {company.size}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-2 h-4 w-4" />
                  <span>{company.sector}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{company.country}</span>
                </div>

                {company.website && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{company.contacts_count} contacts</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Building className="mr-1 h-4 w-4" />
                    <span>{company.deals_count} deals</span>
                  </div>
                </div>

                {company.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {company.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}