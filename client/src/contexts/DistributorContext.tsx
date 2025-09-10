import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Distributor {
  id: string
  name: string
  email: string
  phone: string
  level: 'agente' | 'distribuidor' | 'socio'
  discount: string
  minimumPurchase: string
  status: 'pending' | 'approved' | 'rejected'
}

interface DistributorContextType {
  distributor: Distributor | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const DistributorContext = createContext<DistributorContextType | undefined>(undefined)

export function DistributorProvider({ children }: { children: ReactNode }) {
  const [distributor, setDistributor] = useState<Distributor | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if distributor is already logged in
    const savedDistributor = localStorage.getItem('distributor')
    if (savedDistributor) {
      setDistributor(JSON.parse(savedDistributor))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/distributor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const distributorData = await response.json()
        setDistributor(distributorData)
        localStorage.setItem('distributor', JSON.stringify(distributorData))
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error de autenticación')
        return false
      }
    } catch (error) {
      setError('Error de conexión')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setDistributor(null)
    localStorage.removeItem('distributor')
  }

  const value: DistributorContextType = {
    distributor,
    login,
    logout,
    isLoading,
    error
  }

  return (
    <DistributorContext.Provider value={value}>
      {children}
    </DistributorContext.Provider>
  )
}

export function useDistributor() {
  const context = useContext(DistributorContext)
  if (context === undefined) {
    throw new Error('useDistributor must be used within a DistributorProvider')
  }
  return context
}