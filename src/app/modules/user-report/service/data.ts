export class UserReportBean{
    fullName?: string
    email?: string
    countOrder?: number
    lastOrder?: number
}

export class UserDirectionsBean{
    id?: number
    addressStreet?: string
    defaul?: number
    lng?: number
    lat?: number
    alias?: string
    reference?: string
    floor?: number
    enable?: boolean
    zone?: ZoneBean
}

export class ZoneBean {
    id?: number
    name?: string
}