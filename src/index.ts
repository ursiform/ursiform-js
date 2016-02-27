// Copyright 2015-2016 Afshin Darian. All rights reserved.
// Use of this source code is governed by The MIT License
// that can be found in the LICENSE file.

import * as api from './interfaces';

import {
  Signal, ISignal
} from 'phosphor-signaling';

import * as agent from 'superagent';


const BASE_URL = 'https://www.ursiform.com/api';

const SERVER = !(typeof window === 'object' && 'XMLHttpRequest' in window);

const USER_AGENT = '%USER_AGENT%';

const CSRF = true;

const activitySignal = new Signal<UrsiformClient, api.IResponse>();


function reject(message: string): Promise<api.IResponse> {
  let response: api.IResponse = {
    message: USER_AGENT + message,
    http: null,
    status: 0,
    success: false,
    data: null
  };
  return Promise.reject(response);
}


export
class UrsiformClient {
  constructor(config: { base?: string, sessionid?: string }) {
    this.base = config.base || BASE_URL;
    this.sessionid = config.sessionid || '';
  }

  get activity(): ISignal<UrsiformClient, api.IResponse> {
    return activitySignal.bind(this);
  }

  get base(): string {
    return this._base;
  }

  set base(base: string) {
    this._base = base;
  }

  get sessionid(): string {
    return this._sessionid;
  }

  set sessionid(sessionid: string) {
    this._sessionid = sessionid;
  }

  createForm(params: api.Form.ICreate): Promise<api.IResponse> {
    if (!params) {
      return reject('#createForm: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/forms';
    request.body = params;
    return this._execute(request, CSRF);
  }

  createOrg(params: api.Org.ICreate): Promise<api.IResponse> {
    if (!params) {
      return reject('#createOrg: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/orgs';
    request.body = params;
    return this._execute(request, CSRF);
  }

  createUser(params: api.User.ICreate): Promise<api.IResponse> {
    if (!params) {
      return reject('#createOrg: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/users';
    request.body = params;
    return this._execute(request, CSRF);
  }

  deleteAllSessions(params: api.Session.IDeleteAll): Promise<api.IResponse> {
    if (!params) {
      return reject('#deleteAllSessions: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/users/${params.id || params.email}/sessions`;
    return this._execute(request);
  }

  deleteForm(params: api.Form.IDelete): Promise<api.IResponse> {
    if (!params) {
      return reject('#deleteForm: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/forms/${params.id}`;
    return this._execute(request);
  }

  deleteOrg(params: api.Org.IDelete): Promise<api.IResponse> {
    if (!params) {
      return reject('#deleteOrg: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/orgs/${params.id || params.slug}`;
    return this._execute(request);
  }

  deleteSession(params: api.Session.IDelete): Promise<api.IResponse> {
    if (!params) {
      return reject('#deleteSession: params are required');
    }
    let request: api.IRequest = Object.create(null);
    let { id, email, sessionid } = params;
    request.method = 'DELETE';
    request.url = `/users/${id || email}/sessions/${sessionid}`;
    return this._execute(request);
  }

  deleteUser(params: api.User.IDelete): Promise<api.IResponse> {
    if (!params) {
      return reject('#deleteUser: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/users/${params.id || params.email}`;
    return this._execute(request);
  }

  login(params: api.Session.ILogin): Promise<api.IResponse> {
    if (!params) {
      return reject('#login: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/login';
    request.query = {};
    request.body = {};
    request.body['email'] = params.email;
    request.body['password'] = params.password;
    ['includeauth', 'includeorg', 'includesession'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return this._execute(request).then((response: api.IResponse) => {
      this.sessionid = response.data.sessionid;
      return response;
    });
  }

  logout(): Promise<api.IResponse> {
    let request: api.IRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/logout';
    return this._execute(request, CSRF);
  }

  readForm(params: api.Form.IRead): Promise<api.IResponse> {
    if (!params) {
      return reject('#readForm: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/forms/${params.id}`;
    return this._execute(request);
  }

  readForms(params: api.Form.IReadList = {}): Promise<api.IResponse> {
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/forms';
    request.query = {};
    ['limit', 'offset'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return this._execute(request);
  }

  readOrg(params: api.Org.IRead): Promise<api.IResponse> {
    if (!params) {
      return reject('#readOrg: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/orgs/${params.id || params.slug}`;
    return this._execute(request);
  }

  readOrgs(params: api.Org.IReadList = {}): Promise<api.IResponse> {
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/forms';
    request.query = {};
    ['limit', 'offset'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return this._execute(request);
  }

  readUser(params: api.User.IRead): Promise<api.IResponse> {
    if (!params) {
      return reject('#readUser: params are required');
    }
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/users/${params.id || params.email}`;
    request.query = {};
    ['includeauth', 'includeorg', 'includesession'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return this._execute(request);
  }

  readUsers(params: api.User.IReadList = {}): Promise<api.IResponse> {
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/users';
    request.query = {};
    ['limit', 'offset', 'includeauth', 'includeorg', 'includesession']
      .forEach(key => {
        if (params.hasOwnProperty(key)) {
          request.query[key] = (params as any)[key];
        }
      });
    return this._execute(request);
  }

  whoami(params: api.Session.IWhoAmI = {}): Promise<api.IResponse> {
    let request: api.IRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/whoami';
    request.query = {};
    ['includeauth', 'includeorg', 'includesession'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return this._execute(request).then((response: api.IResponse) => {
      this.sessionid = response.data.sessionid;
      return response;
    });
  }

  private _execute(http: api.IRequest, csrf?: boolean): Promise<api.IResponse> {
    http.url = `${this.base}${http.url}`;
    let request = this._request(http, csrf);
    if (SERVER) {
      request.set('user-agent', USER_AGENT);
      if (this.sessionid) request.set('cookie', `sessionid=${this.sessionid}`);
    }
    return new Promise<api.IResponse>((resolve, reject) => {
      request.end((error, result) => {
        const status: number = result && result.status
          || error && error.status
          || 0;
        let response: api.IResponse;
        if (result.body) {
          let { data, message, success } = result.body;
          response = { success, message, data, status, http };
        } else {
          let success = false;
          let message = error && error.message;
          response = { success, message, status, http };
        }
        if (SERVER) {
          process.nextTick(() => { this.activity.emit(response); });
        } else {
          requestAnimationFrame(() => { this.activity.emit(response); });
        }
        if (response.success) {
          return resolve(response);
        } else {
          return reject(response);
        }
      });
    });
  }

  private _request(http: api.IRequest, csrf: boolean): agent.SuperAgentRequest {
    switch (http.method) {
    case 'DELETE':
      return agent.del(http.url).query(http.query);
    case 'GET':
      return agent.get(http.url).query(http.query);
    case 'POST':
      if (csrf) {
        if (!http.body) http.body = {};
        http.body['sessionid'] = this.sessionid;
      }
      return agent.post(http.url).query(http.query).send(http.body);
    case 'PUT':
      return agent.put(http.url).query(http.query).send(http.body);
    }
  }

  private _base: string;
  private _sessionid: string;
}
