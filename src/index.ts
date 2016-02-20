// Copyright 2015-2016 Afshin Darian. All rights reserved.
// Use of this source code is governed by The MIT License
// that can be found in the LICENSE file.

import * as api from './interfaces';

import {
  Signal, ISignal
} from 'phosphor-signaling';

import * as superagent from 'superagent';


const BASE_URL = 'https://www.ursiform.com/api';

const NAMESPACE = 'UrsiformClient';

const SERVER = !(typeof window === 'object' && 'XMLHttpRequest' in window);

const USER_AGENT = '%USER_AGENT%';

const CSRF = true;

const activitySignal = new Signal<UrsiformClient, IAPIResponse>();


export
interface IHTTPRequest {
  method: string;
  url: string;
  query?: { [key: string]: any };
  body?: { [key: string]: any };
}

export
interface IAPIResponse {
  data?: any;
  message?: string;
  http: IHTTPRequest;
  status: number;
  success: boolean;
}


function execute(http: IHTTPRequest, csrf?: boolean): Promise<IAPIResponse> {
  let request: superagent.SuperAgentRequest;
  http.url = `${this.base}${http.url}`;
  switch (http.method) {
  case 'DELETE':
    request = superagent.del(http.url).query(http.query);
    break;
  case 'GET':
    request = superagent.get(http.url).query(http.query);
    break;
  case 'POST':
    if (csrf) {
      if (!http.body) http.body = {};
      http.body['sessionid'] = this.sessionid;
    }
    request = superagent.post(http.url).query(http.query).send(http.body);
    break;
  case 'PUT':
    request = superagent.put(http.url).query(http.query).send(http.body);
    break;
  default:
    let success = false;
    let status = 0;
    let message = `unsupported method: ${http.method}`;
    return Promise.reject({ success, status, message, http });
  }
  if (SERVER) {
    request.set('user-agent', USER_AGENT);
    if (this.sessionid) request.set('cookie', `sessionid=${this.sessionid}`);
  }
  return new Promise<IAPIResponse>((resolve, reject) => {
    request.end((error, result) => {
      const status: number = result && result.status
        || error && error.status
        || 0;
      let response: IAPIResponse;
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


function reject(message: string): Promise<IAPIResponse> {
  let response: IAPIResponse = {
    message: NAMESPACE + message,
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

  get activity(): ISignal<UrsiformClient, IAPIResponse> {
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

  createForm(params: api.ICreateForm): Promise<IAPIResponse> {
    if (!params) {
      return reject('#createForm: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/forms';
    request.body = params;
    return execute.call(this, request, CSRF);
  }

  createOrg(params: api.ICreateOrg): Promise<IAPIResponse> {
    if (!params) {
      return reject('#createOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/orgs';
    request.body = params;
    return execute.call(this, request, CSRF);
  }

  createUser(params: api.ICreateUser): Promise<IAPIResponse> {
    if (!params) {
      return reject('#createOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/users';
    request.body = params;
    return execute.call(this, request, CSRF);
  }

  deleteAllSessions(params: api.IDeleteAllSessions): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteAllSessions: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/users/${params.id || params.email}/sessions`;
    return execute.call(this, request);
  }

  deleteForm(params: api.IDeleteForm): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteForm: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/forms/${params.id}`;
    return execute.call(this, request);
  }

  deleteOrg(params: api.IDeleteOrg): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/orgs/${params.id || params.slug}`;
    return execute.call(this, request);
  }

  deleteSession(params: api.IDeleteSession): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteSession: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    let { id, email, sessionid } = params;
    request.method = 'DELETE';
    request.url = `/users/${id || email}/sessions/${sessionid}`;
    return execute.call(this, request);
  }

  deleteUser(params: api.IDeleteUser): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteUser: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/users/${params.id || params.email}`;
    return execute.call(this, request);
  }

  login(params: api.ILogin): Promise<IAPIResponse> {
    if (!params) {
      return reject('#login: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
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
    return execute.call(this, request).then((response: IAPIResponse) => {
      this.sessionid = response.data.sessionid;
      return response;
    });
  }

  logout(): Promise<IAPIResponse> {
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/logout';
    return execute.call(this, request, CSRF);
  }

  readForm(params: api.IReadForm): Promise<IAPIResponse> {
    if (!params) {
      return reject('#readForm: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/forms/${params.id}`;
    return execute.call(this, request);
  }

  readForms(params: api.IReadForms = {}): Promise<IAPIResponse> {
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/forms';
    request.query = {};
    ['limit', 'offset'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return execute.call(this, request);
  }

  readOrg(params: api.IReadOrg): Promise<IAPIResponse> {
    if (!params) {
      return reject('#readOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/orgs/${params.id || params.slug}`;
    return execute.call(this, request);
  }

  readOrgs(params: api.IReadOrgs = {}): Promise<IAPIResponse> {
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/forms';
    request.query = {};
    ['limit', 'offset'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return execute.call(this, request);
  }

  readUser(params: api.IReadUser): Promise<IAPIResponse> {
    if (!params) {
      return reject('#readUser: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/users/${params.id || params.email}`;
    request.query = {};
    ['includeauth', 'includeorg', 'includesession'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return execute.call(this, request);
  }

  readUsers(params: api.IReadUsers = {}): Promise<IAPIResponse> {
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/users';
    request.query = {};
    ['limit', 'offset', 'includeauth', 'includeorg', 'includesession']
      .forEach(key => {
        if (params.hasOwnProperty(key)) {
          request.query[key] = (params as any)[key];
        }
      });
    return execute.call(this, request);
  }

  whoami(params: api.IWhoAmI = {}): Promise<IAPIResponse> {
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = '/whoami';
    request.query = {};
    ['includeauth', 'includeorg', 'includesession'].forEach(key => {
      if (params.hasOwnProperty(key)) {
        request.query[key] = (params as any)[key];
      }
    });
    return execute.call(this, request).then((response: IAPIResponse) => {
      this.sessionid = response.data.sessionid;
      return response;
    });
  }

  private _base: string;
  private _sessionid: string;
}
