import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const internalApiKey = environment.internalApiKey;

    let headers = req.headers.set('x-internal-api-key', internalApiKey);

    const clonedReq = req.clone({
        headers,
        withCredentials: true // Automáticamente envía la HttpOnly cookie al backend
    });
    return next(clonedReq);
};
