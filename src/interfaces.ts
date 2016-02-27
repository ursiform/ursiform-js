// Copyright 2015-2016 Afshin Darian. All rights reserved.
// Use of this source code is governed by The MIT License
// that can be found in the LICENSE file.

// Top-level interfaces
export
interface IRequest {
  method: string;
  url: string;
  query?: { [key: string]: any };
  body?: { [key: string]: any };
}


export
interface IResponse {
  data?: any;
  message?: string;
  http: IRequest;
  status: number;
  success: boolean;
}


export
namespace Form {
  export
  interface ICreate {
    process: string;
    org: string;
    name: string;
    access: string;
  }

  export
  interface IRead {
    id: string;
  }

  export
  interface IReadList {
    limit?: number;
    offset?: number;
  }

  export
      interface IDelete {
      id: string;
  }
}


export
namespace FormSpec {
  // Form spec primitives
  export
  interface ISystemFields {}

  export
  interface IFormField {}

  // Form spec CRUD
  export
  interface ICreate {
    description: string;
    form: string;
    system: ISystemFields;
    fields: IFormField[];
  }
}

export
namespace Org {
  export
  interface ICreate {
    name: string;
    slug: string;
    description: string;
  }

  export
  interface IRead {
    id?: string;
    slug?: string;
  }

  export
  interface IReadList {
    limit?: number;
    offset?: number;
  }

  export
  interface IDelete {
    id?: string;
    slug?: string;
  }
}


export
namespace Session {
  export
  interface ILogin {
    email: string;
    password: string;
    includeauth?: boolean;
    includeorg?: boolean;
    includesession?: boolean;
  }

  export
  interface IDelete {
    id?: string;
    email?: string;
    sessionid: string;
  }

  export
  interface IDeleteAll {
    id?: string;
    email?: string;
  }

  export
  interface IWhoAmI {
    includeauth?: boolean;
    includeorg?: boolean;
    includesession?: boolean;
  }
}


export
namespace User {
  export
  interface ICreate {
    email: string;
    org: string;
    password: string;
    role: string;
  }

  export
  interface IRead {
    id?: string;
    email?: string;
    includeauth?: boolean;
    includeorg?: boolean;
    includesession?: boolean;
  }

  export
  interface IReadList {
    limit?: number;
    offset?: number;
    includeauth?: boolean;
    includeorg?: boolean;
    includesession?: boolean;
  }

  export
  interface IDelete {
    id?: string;
    email?: string;
  }
}
