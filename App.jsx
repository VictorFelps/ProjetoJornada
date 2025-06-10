import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Loader2, Search, Filter, BarChart3, Users, Route } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:3000'

function App() {
  const [journeys, setJourneys] = useState([])
  const [filteredJourneys, setFilteredJourneys] = useState([])
  const [stats, setStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_BASE_URL}/journeys`)

        if (!response.ok) {
          throw new Error('Erro ao carregar dados da API')
        }

        const data = await response.json()

        setJourneys(data.journeys)
        setFilteredJourneys(data.journeys)
        setStats(data.stats)
      } catch (err) {
        setError(err.message)
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Aplica filtros e busca
  useEffect(() => {
    let filtered = journeys

    // Filtro por busca (sessionId ou canal)
    if (searchTerm) {
      filtered = filtered.filter(journey => 
        journey.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journey.journey.some(channel => 
          channel.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredJourneys(filtered)
  }, [journeys, searchTerm])

  const clearFilters = () => {
    setSearchTerm('')
  }

  const formatJourney = (journey) => {
    return journey.map((channel, index) => (
      <span key={index} className="inline-flex items-center">
        <Badge variant="outline" className="mr-1">
          {channel}
        </Badge>
        {index < journey.length - 1 && (
          <span className="mx-1 text-muted-foreground">→</span>
        )}
      </span>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados das jornadas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados da API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard de Jornadas de Usuários</h1>
          <p className="text-muted-foreground">
            Análise de touchpoints e canais de aquisição de usuários
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Jornadas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredJourneys.length}</div>
              <p className="text-xs text-muted-foreground">
                {journeys.length} jornadas no total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Touchpoints</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredJourneys.length > 0 
                  ? (filteredJourneys.reduce((sum, j) => sum + j.touchpointCount, 0) / filteredJourneys.length).toFixed(1)
                  : '0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                touchpoints por jornada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canais Únicos</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(filteredJourneys.flatMap(j => j.journey)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                canais diferentes identificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="SessionId ou canal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ações</label>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journeys Table */}
        <Card>
          <CardHeader>
            <CardTitle>Jornadas de Usuários</CardTitle>
            <CardDescription>
              {filteredJourneys.length} jornadas encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Jornada</TableHead>
                    <TableHead className="text-center">Touchpoints</TableHead>
                    <TableHead>Primeiro Canal</TableHead>
                    <TableHead>Último Canal</TableHead>
                    <TableHead>Período</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJourneys.slice(0, 20).map((journey) => (
                    <TableRow key={journey.sessionId}>
                      <TableCell className="font-mono text-sm">
                        {journey.sessionId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {formatJourney(journey.journey)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {journey.touchpointCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {journey.firstTouchpoint.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {journey.lastTouchpoint.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>
                          <div>{formatDate(journey.firstTouchpoint.created_at)}</div>
                          {journey.touchpointCount > 1 && (
                            <div>até {formatDate(journey.lastTouchpoint.created_at)}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredJourneys.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma jornada encontrada com os filtros aplicados.
                </p>
              </div>
            )}

            {filteredJourneys.length > 20 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando primeiras 20 jornadas de {filteredJourneys.length} encontradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

