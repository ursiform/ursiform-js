// Copyright 2015-2016 Afshin Darian. All rights reserved.
// Use of this source code is governed by The MIT License
// that can be found in the LICENSE file.

import {
  Signal, ISignal
} from 'phosphor-signaling';

import * as superagent from 'superagent';

const BASE_URL = 'https://www.ursiform.com/api';

const NAMESPACE = 'UrsiformClient';

const SERVER = !(typeof window === 'object' && 'XMLHttpRequest' in window);

const USERAGENT = '%USERAGENT%';

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

// forms
export
interface ICreateForm {
  process: string;
  org: string;
  name: string;
  access: string;
}

export
interface IDeleteForm {
  id: string;
}

export
interface IReadForm {
  id: string;
}

export
interface IReadForms {
  limit?: number;
  offset?: number;
}

// orgs

export
interface ICreateOrg {
  name: string;
  slug: string;
  description: string;
}

export
interface IReadOrg {
  id?: string;
  slug?: string;
}

export
interface IReadOrgs {
  limit?: number;
  offset?: number;
}

export
interface IDeleteOrg {
  id?: string;
  slug?: string;
}

// users

export
interface ICreateUser {
  email: string;
  org: string;
  password: string;
  role: string;
};

export
interface IReadUser {
  id?: string;
  email?: string;
  includeauth?: boolean;
  includeorg?: boolean;
  includesession?: boolean;
}

export
interface IReadUsers {
  limit?: number;
  offset?: number;
  includeauth?: boolean;
  includeorg?: boolean;
  includesession?: boolean;
}

export
interface IDeleteUser {
  id?: string;
  email?: string;
}

// login

export
interface ILogin {
  email: string;
  password: string;
  includeauth?: boolean;
  includeorg?: boolean;
  includesession?: boolean;
}

// sessions
export
interface IDeleteSession {
  id?: string;
  email?: string;
  sessionid: string;
}

export
interface IDeleteAllSessions {
  id?: string;
  email?: string;
}

// whoami
export
interface IWhoAmI {
  includeauth?: boolean;
  includeorg?: boolean;
  includesession?: boolean;
}


function execute(http: IHTTPRequest, csrf?: boolean): Promise<IAPIResponse> {
  const host = this.host;
  const sessionid = this.sessionid;
  return new Promise<IAPIResponse>((resolve, reject) => {
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
      return reject({
        success: false,
        status: 0,
        message: `unsupported method: ${http.method}`,
        http: http
      });
    }
    if (SERVER) {
      request.set('user-agent', USERAGENT);
      if (sessionid) request.set('cookie', `sessionid=${sessionid}`);
    }
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
      if (response.success) resolve(response); else reject(response);
      this.activity.emit(response);
    });
  });
}


function reject (message: string): Promise<IAPIResponse> {
  let response: IAPIResponse = {
    message: `${NAMESPACE}message`,
    http: null,
    status: 0,
    success: false
  };
  return Promise.reject(response);
}


export
class UrsiformClient {
  constructor(config: { base?: string, sessionid?: string }) {
    this.base = config.base || BASE_URL;
    this.sessionid = config.sessionid || '';
  }

  base: string;

  get activity(): ISignal<UrsiformClient, IAPIResponse> {
    return activitySignal.bind(this);
  }

  get sessionid(): string {
    return this._sessionid;
  }

  set sessionid(sessionid: string) {
    this._sessionid = sessionid;
  }

  createForm(params: ICreateForm): Promise<IAPIResponse> {
    if (!params) {
      return reject('#createForm: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/forms';
    request.body = params;
    return execute.call(this, request, CSRF);
  }

  createOrg(params: ICreateOrg): Promise<IAPIResponse> {
    if (!params) {
      return reject('#createOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/orgs';
    request.body = params;
    return execute.call(this, request, CSRF);
  }

  createUser(params: ICreateUser): Promise<IAPIResponse> {
    if (!params) {
      return reject('#createOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'POST';
    request.url = '/users';
    request.body = params;
    return execute.call(this, request, CSRF);
  }

  deleteAllSessions(params: IDeleteAllSessions): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteAllSessions: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/users/${params.id || params.email}/sessions`;
    return execute.call(this, request);
  }

  deleteForm(params: IDeleteForm): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteForm: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/forms/${params.id}`;
    return execute.call(this, request);
  }

  deleteOrg(params: IDeleteOrg): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/orgs/${params.id || params.slug}`;
    return execute.call(this, request);
  }

  deleteSession(params: IDeleteSession): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteSession: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    let { id, email, sessionid } = params;
    request.method = 'DELETE';
    request.url = `/users/${id || email}/sessions/${sessionid}`;
    return execute.call(this, request);
  }

  deleteUser(params: IDeleteUser): Promise<IAPIResponse> {
    if (!params) {
      return reject('#deleteUser: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'DELETE';
    request.url = `/users/${params.id || params.email}`;
    return execute.call(this, request);
  }

  login(params: ILogin): Promise<IAPIResponse> {
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

  readForm(params: IReadForm): Promise<IAPIResponse> {
    if (!params) {
      return reject('#readForm: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/forms/${params.id}`;
    return execute.call(this, request);
  }

  readForms(params: IReadForms = {}): Promise<IAPIResponse> {
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

  readOrg(params: IReadOrg): Promise<IAPIResponse> {
    if (!params) {
      return reject('#readOrg: params are required');
    }
    let request: IHTTPRequest = Object.create(null);
    request.method = 'GET';
    request.url = `/orgs/${params.id || params.slug}`;
    return execute.call(this, request);
  }

  readOrgs(params: IReadOrgs = {}): Promise<IAPIResponse> {
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

  readUser(params: IReadUser): Promise<IAPIResponse> {
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

  readUsers(params: IReadUsers = {}): Promise<IAPIResponse> {
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

  whoami(params: IWhoAmI = {}): Promise<IAPIResponse> {
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

  private _sessionid: string;
}
