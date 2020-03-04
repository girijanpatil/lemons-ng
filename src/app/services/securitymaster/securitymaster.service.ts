import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityMasterService {

  constructor(private http: HttpService) { }

  private BASE_PATH = 'Securitymaster';

  getAll() {
    return this.http.getAll(this.BASE_PATH);
  }

  get(id) {
    return this.http.get(this.BASE_PATH, id);
  }

  save(model) {
    return this.http.post(this.BASE_PATH, model);
  }

  update(id, model) {
    return this.http.put(this.BASE_PATH, id, model);
  }

  delete(id) {
    return this.http.delete(this.BASE_PATH, id);
  }
}
