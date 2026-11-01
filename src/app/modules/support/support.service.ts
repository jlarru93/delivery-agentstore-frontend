import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment as env } from 'src/environments/environment';
import { ObjetResponse } from 'src/app/models';
import { CaseFileRequest, NewStoreCase, StoreCase, StoreCaseDetail, StoreOption, SupportCategory } from './support.models';

// Casos del local en la Mesa de ayuda de Piwi (POS: authorizer del personal, el token lo agrega el interceptor).
@Injectable({ providedIn: 'root' })
export class SupportService {

    private base = `${env.url.backWorkboard}/party/agent-store`

    constructor(private http: HttpClient) {}

    cases(): Observable<ObjetResponse<StoreCase[]>> {
        return this.http.get<ObjetResponse<StoreCase[]>>(`${this.base}/items`)
    }

    detail(code: string): Observable<ObjetResponse<StoreCaseDetail>> {
        return this.http.get<ObjetResponse<StoreCaseDetail>>(`${this.base}/items/${encodeURIComponent(code)}`)
    }

    reply(code: string, body: string, files: CaseFileRequest[]): Observable<ObjetResponse<{ sent: boolean }>> {
        return this.http.post<ObjetResponse<{ sent: boolean }>>(`${this.base}/items/${encodeURIComponent(code)}/messages`, { body, files })
    }

    stores(): Observable<ObjetResponse<StoreOption[]>> {
        return this.http.get<ObjetResponse<StoreOption[]>>(`${this.base}/stores`)
    }

    categories(): Observable<ObjetResponse<SupportCategory[]>> {
        return this.http.get<ObjetResponse<SupportCategory[]>>(`${this.base}/categories`)
    }

    create(request: NewStoreCase): Observable<ObjetResponse<{ code: string }>> {
        return this.http.post<ObjetResponse<{ code: string }>>(`${this.base}/items`, request)
    }

    /** Sube una foto o PDF con utils (carpeta workboard/files/; la misma ruta que la web del cliente) */
    upload(file: File): Observable<CaseFileRequest> {
        const form = new FormData()
        form.append('file', file)
        return this.http.post<ObjetResponse<{ Location: string }>>(`${env.url.util_banckEnd}/s3/upload/workboard`, form)
            .pipe(map(resp => ({ url: resp.data.Location, fileName: file.name })))
    }
}
