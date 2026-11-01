// Mesa de ayuda vista por el local en el POS (delivery-workboard-backend, /party/agent-store/*).
// El comercio ve solo lo que Piwi le dirige: nunca notas internas ni datos del cliente.

export interface StoreCase {
    code: string
    title: string
    status: string            // etiqueta pública: Recibido, En proceso, Necesitamos tu respuesta…
    statusCategory: string    // TODO | IN_PROGRESS | WAITING | DONE | CANCELLED
    storeId: number
    storeName: string
    orderId: string | null
    openedBy: 'STORE' | 'PIWI'
    needsYou: boolean         // Piwi espera tu respuesta
    createdAt: string
    updatedAt: string
}

export interface CaseEntry {
    at: string
    kind: 'RECEIVED' | 'STATUS' | 'TEAM' | 'YOU' | 'REOPENED'
    text: string
}

export interface CaseFile {
    fileName: string
    url: string
    kind: string              // IMAGE | PDF…
    fromYou: boolean
    at: string
}

export interface StoreCaseDetail {
    code: string
    title: string
    status: string
    statusCategory: string
    steps: string[]
    currentStep: number       // -1 = rechazado o anulado
    createdAt: string
    dueAt: string | null
    canReply: boolean
    timeline: CaseEntry[]
    files: CaseFile[]
    storeId: number
    storeName: string
    orderId: string | null
    rating: CaseRating | null // si la incidencia nació de una calificación del cliente
}

/** Lo que el cliente calificó y escribió del pedido ("María G.") */
export interface CaseRating {
    about: 'STORE' | 'DRIVER'  // tu local | el repartidor del pedido
    stars: number
    comment: string | null
    customer: string
    createdAt: string | null
}

export interface SupportCategory {
    code: string
    name: string
    parent: string | null
}

export interface CaseFileRequest {
    url: string
    fileName?: string
}

export interface NewStoreCase {
    storeId: number
    categoryCode?: string | null
    orderId?: number | null
    title: string
    body: string
    files: CaseFileRequest[]
}

export interface StoreOption {
    id: number
    name: string
}
