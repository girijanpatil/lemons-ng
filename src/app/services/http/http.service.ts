import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  BASE_PATH = 'api/';
  // BASE_PATH = environment.apiHost;

  getAll(path: string) {
    return this.http.get(this.BASE_PATH + path);
  }

  get(path: string, id: string) {
    return this.http.get(this.BASE_PATH + path + '/' + id);
  }

  post(path, model) {
    return this.http.post(this.BASE_PATH + path, model);
  }

  put(path, id, model) {
    return this.http.put(this.BASE_PATH + path + '/' + id, model);
  }

  delete(path, id) {
    return this.http.delete(this.BASE_PATH + path + '/' + id);
  }
}
