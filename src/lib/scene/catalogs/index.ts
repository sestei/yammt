import { parseLensCatalog, type LensCatalog } from './catalog'
import { DEFAULT_THIN_LENSES_CATALOG } from './defaultThinLenses'
import thorlabsPlanoConcaveBk7 from './thorlabs-plano-concave-bk7.json'
import thorlabsPlanoConcaveFusedSilica from './thorlabs-plano-concave-fused-silica.json'
import thorlabsPlanoConvexBk7 from './thorlabs-plano-convex-bk7.json'
import thorlabsPlanoConvexFusedSilica from './thorlabs-plano-convex-fused-silica.json'
import unionOpticsFusedSilica from './union-optics-fused-silica.json'

export const LENS_CATALOGS: LensCatalog[] = [
  DEFAULT_THIN_LENSES_CATALOG,
  parseLensCatalog(
    'thorlabs-plano-convex-fused-silica',
    'Thorlabs Plano-Convex (Fused Silica)',
    thorlabsPlanoConvexFusedSilica,
  ),
  parseLensCatalog('thorlabs-plano-convex-bk7', 'Thorlabs Plano-Convex (N-BK7)', thorlabsPlanoConvexBk7),
  parseLensCatalog(
    'thorlabs-plano-concave-fused-silica',
    'Thorlabs Plano-Concave (Fused Silica)',
    thorlabsPlanoConcaveFusedSilica,
  ),
  parseLensCatalog('thorlabs-plano-concave-bk7', 'Thorlabs Plano-Concave (N-BK7)', thorlabsPlanoConcaveBk7),
  parseLensCatalog('union-optics-fused-silica', 'Union Optics (Fused Silica)', unionOpticsFusedSilica),
]
