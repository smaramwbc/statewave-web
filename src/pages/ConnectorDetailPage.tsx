import { useParams } from 'react-router'
import { ConnectorPage } from '../components/connector/ConnectorPage'
import { CONNECTORS } from '../content/connectors'
import { NotFoundPage } from './NotFoundPage'

export function ConnectorDetailPage() {
  const { slug = '' } = useParams()
  const c = CONNECTORS[slug]
  return c ? <ConnectorPage c={c} /> : <NotFoundPage />
}
