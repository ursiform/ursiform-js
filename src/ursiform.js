// Copyright 2015 Afshin Darian. All rights reserved.
// Use of this source code is governed by The MIT License
// that can be found in the LICENSE file.

import EventEmitter from 'eventemitter3';
import superagent from 'superagent';
const execute = Symbol();
const methods = {DELETE: 'del', GET: 'get', POST: 'post', PUT: 'put'};
const namespace = 'UrsiformClient';
const server = !(typeof window === 'object' && 'XMLHttpRequest' in window);

export default class Client extends EventEmitter {
    constructor (config) {
        super();
        if (!config || !config.base)
            throw new Error(namespace + '#constructor: base url is undefined');
        this.base = config.base;
        this.prefix = config.prefix || '';
        this.sessionid = config.sessionid || '';
    }

    // to make this[execute] private, a locally scoped Symbol is used
    [execute](options) {
        const host = this.host;
        const sessionid = this.sessionid;
        return new Promise((resolve, reject) => {
            let request = superagent[methods[options.method]](options.url)
                .query(options.query)
                .send(options.body);
            if (server && sessionid)
                request.set('cookie', `sessionid=${sessionid}`);
            request.end((error, result) => {
                const status = result && result.status || 0;
                let output = result && result.body ||
                    {success: false, message: error.message};

                // top-level "http.method" field indicates HTTP method
                // top-level "http.status" field indicates HTTP status code
                // top-level "http.url" field indicates requested URL
                // This is safe because ALL forest responses ONLY contain:
                // {success, message, data}
                output.http = {
                    body: options.body,
                    method: options.method,
                    query: options.query || {},
                    status: status,
                    url: options.url
                };
                if (output.success) resolve(output); else reject(output);
                this.emit(`${status}`, output);
            });
        });
    }

    createOrg (params) {
        if (!params)
            throw new Error(namespace + '#createOrg: params are required');
        const method = 'POST';
        const url = `${this.base}/orgs`;
        let options = {method: method, url: url};
        options.body = {
            name: params.name,
            slug: params.slug,
            description: params.description,
            sessionid: this.sessionid
        };
        return this[execute](options);
    }

    createUser (params) {
        if (!params)
            throw new Error(namespace + '#createUser: params are required');
        const method = 'POST';
        const url = `${this.base}/users`;
        let options = {method: method, url: url};
        options.body = {
            email: params.email,
            org: params.org,
            password: params.password,
            role: params.role,
            sessionid: this.sessionid
        };
        return this[execute](options);
    }

    deleteSession (params) {
        if (!params)
            throw new Error(namespace + '#deleteSession: params are required');
        const method = 'DELETE';
        const url = `${this.base}/users/${params.id || params.email}/sessions/${params.sessionid}`;
        const options = {method: method, url: url};
        return this[execute](options);
    }

    deleteUser (params) {
        if (!params)
            throw new Error(namespace + '#deleteUser: params are required');
        const method = 'DELETE';
        const url = `${this.base}/users/${params.id || params.email}`;
        const options = {method: method, url: url};
        return this[execute](options);
    }

    getForms (params = {}) {
        const method = 'GET';
        const url = `${this.base}/forms`;
        let options = {method: method, url: url, query: {}};
        if (params.hasOwnProperty('limit'))
            options.query.limit = params.limit;
        if (params.hasOwnProperty('offset'))
            options.query.offset = params.offset;
        return this[execute](options);
    }

    getUser (params) {
        if (!params)
            throw new Error(namespace + '#getUser: params are required');
        const method = 'GET';
        const url = `${this.base}/users/${params.id || params.email}`;
        let options = {method: method, url: url, query: {}};
        if (params.hasOwnProperty('includeauth'))
            options.query.includeauth = !!params.includeauth;
        if (params.hasOwnProperty('includeorg'))
            options.query.includeorg = !!params.includeorg;
        if (params.hasOwnProperty('includesession'))
            options.query.includesession = !!params.includesession;
        return this[execute](options);
    }

    getUsers (params = {}) {
        const method = 'GET';
        const url = `${this.base}/users`;
        let options = {method: method, url: url, query: {}};
        if (params.hasOwnProperty('limit'))
            options.query.limit = params.limit;
        if (params.hasOwnProperty('offset'))
            options.query.offset = params.offset;
        if (params.hasOwnProperty('includeauth'))
            options.query.includeauth = !!params.includeauth;
        if (params.hasOwnProperty('includeorg'))
            options.query.includeorg = !!params.includeorg;
        if (params.hasOwnProperty('includesession'))
            options.query.includesession = !!params.includesession;
        return this[execute](options);
    }

    login (params) {
        if (!params)
            throw new Error(namespace + '#login: params are required');
        const method = 'POST';
        const url = `${this.base}/login`;
        let options = {method: method, url: url};
        options.body = {email: params.email, password: params.password};
        return this[execute](options).then((response) => {
            this.sessionid = response.data.sessionid;
            return response;
        });
    }

    logout () {
        const method = 'POST';
        const url = `${this.base}/logout`;
        let options = {method: method, url: url};
        options.body = {sessionid: this.sessionid};
        return this[execute](options);
    }

    whoami (params) {
        const method = 'GET';
        const url = `${this.base}/whoami`;
        const options = {method: method, url: url, query: {}};
        if (params.hasOwnProperty('includeauth'))
            options.query.includeauth = !!params.includeauth;
        if (params.hasOwnProperty('includeorg'))
            options.query.includeorg = !!params.includeorg;
        if (params.hasOwnProperty('includesession'))
            options.query.includesession = !!params.includesession;
        return this[execute](options).then((response) => {
            this.sessionid = response.data.sessionid;
            return response;
        });
    }
}
