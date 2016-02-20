// Copyright 2015-2016 Afshin Darian. All rights reserved.
// Use of this source code is governed by The MIT License
// that can be found in the LICENSE file.

// Form CRUD
export
interface ICreateForm {
  process: string;
  org: string;
  name: string;
  access: string;
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

export
    interface IDeleteForm {
    id: string;
}

// Org CRUD
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

// User CRUD
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

// Login
export
interface ILogin {
  email: string;
  password: string;
  includeauth?: boolean;
  includeorg?: boolean;
  includesession?: boolean;
}

// Sessions
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

// Who am I?
export
interface IWhoAmI {
  includeauth?: boolean;
  includeorg?: boolean;
  includesession?: boolean;
}
