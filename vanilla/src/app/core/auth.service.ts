import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiService } from './api.service';
import { JWT } from './jwt';
import { User } from './user.model';

interface State {
  current: User;
  desiredUrl: Array<any>;
}

const defaultState: State = {
  current: null,
  desiredUrl: []
};

const _store = new BehaviorSubject<State>(defaultState);

class Store {
  _store = _store;
  changes = this._store.distinctUntilChanged();

  setState(state: State) {
    this._store.next(Object.assign({}, this.getState(), state));
  }

  getState() {
    return this._store.value;
  }

  purge() {
    this._store.next(defaultState);
  }

}

@Injectable()
export class AuthService {
  _current: User = null;
  currentStore: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  desiredUrl: UrlSegment[] = null;

  constructor(private api: ApiService, private jwt: JWT, private router: Router, private route: ActivatedRoute) {
  }

  attempAuth(type: string, credentials: any) {
    let path = (type === 'signin') ? '/login' : '/signup';
    let url = '/auth' + path;

    this.api.post(url, credentials)
      .map(res => res.json())
      .subscribe(res => {
        this.jwt.save(res.id_token);
        this._current = res.user;
        this.currentStore.next(res.user);
        // set Authorization header
        this.setJwtHeader(res.id_token);

        // if (this.desiredUrl) {
        //   this.router.navigate(this.desiredUrl);
        // } else {
        this.router.navigate(['']);
        //}
      });
  }

  ensureAuthIs(b: boolean): Observable<boolean> {
    const auth = new BehaviorSubject<boolean>(false);
    this.verifyAuth()
      .subscribe((authValid) => {
        // if it's the opposite, redirect signin page.
        if (authValid !== b) {
          console.log('not authenticationed.');
          // console.log('this.route.snapshot.url@' + this.route.snapshot.url);
          // this.desiredUrl = this.route.snapshot.url;
          this.router.navigate(['', 'signin']);
          auth.next(false);
        } else {
          console.log('authenticated.');
          auth.next(true);
        }
      });
    return auth.asObservable();
  }

  verifyAuth(): Observable<boolean> {
    const auth = new BehaviorSubject<boolean>(false);

    // jwt token is not found in local storage.
    if (!this.jwt.get()) {
      auth.next(false);
    }

    if (this._current) {
      auth.next(true);
    } else {
      // set jwt header and try to refresh user info.
      this.setJwtHeader(this.jwt.get());

      this.api.get('/me').subscribe(
        res => {
          this._current = res;
          this.currentStore.next(res);
          auth.next(true);
        },
        err => {
          this.jwt.destroy();
          auth.next(false);
        }
      );
    }

    return auth.asObservable();
  }

  logout() {
    // reset the initial values
    this._current = null;
    this.currentStore.next(null);
    //this.desiredUrl = null;

    this.jwt.destroy();
    this.clearJwtHeader();

    this.router.navigate(['']);
  }

  get current(): Observable<User> {
    return this.currentStore.distinctUntilChanged();
  }

  private setJwtHeader(jwt: string) {
    this.api.setHeaders({ Authorization: `Bearer ${jwt}` });
  }

  private clearJwtHeader() {
    this.api.deleteHeader('Authorization');
  }
}
