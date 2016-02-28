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
  interface IUpdate {
    name: string;
    access: string;
    language: FormLanguage.IFormLanguage;
    layout: FormLayout.IFormLayout;
    spec: FormSpec.IFormSpec;
  }

  export
  interface IDelete {
    id: string;
  }
}

export
namespace FormLanguage {
  export
  interface IFormLanguage {
    [reference: string]: string;
  }
}

export
namespace FormLayout {
  export
  interface IFormLayout {
    columns: number;
  }
}

export
namespace FormSpec {
  // Form spec primitives
  export
  interface ISystemFields {
    ip: boolean;
    language: boolean;
    locale: boolean;
    sessionid: boolean;
    useragent: boolean;
    userid: boolean;
  }

  export
  interface IFormField {
    reference: string;
    type: string;
  }

  export
  interface IFormSpec {
    description: string;
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
