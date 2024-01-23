import HttpResponse from './HttpResponse';

class Http {
  static setTokens(accessToken: string | null, refreshToken: string | null) {
    Http.accessToken = accessToken;
    Http.refreshToken = refreshToken;

    if (refreshToken) {
      window.localStorage.setItem('token', refreshToken)
    }
    else {
      window.localStorage.removeItem('token');
    }
  }

  public static accessToken: string | null = null;
  public static refreshToken: string | null = null;
  private static refreshing: Promise<boolean> | null = null;

  public static unauthorizedHandler: (() => void) | null = null;

  static defaultHeaders(): Headers {
    const headers = new Headers({
      Accept: 'application/json',
    });

    if (Http.accessToken) {
      headers.append('Authorization', `Bearer ${Http.accessToken}`);
    }

    return headers;
  }

  static jsonHeaders(): Headers {
    const headers = Http.defaultHeaders();

    headers.append('Content-Type', 'application/json');

    return headers;
  }

  static async fetch<Res>(url: string, headers: Headers, options?: RequestInit): Promise<HttpResponse<Res>> {
    let res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok && res.status === 401 && Http.refreshToken && options) {
      if (!Http.refreshing) {
        Http.refreshing = new Promise(async (resolve, reject) => {
          let res2 = await fetch('/api/v1/refresh', {
            method: 'POST',
            headers: Http.jsonHeaders(),
            body: JSON.stringify({
              data: {
                refresh: Http.refreshToken,
              },
            }),
          });
    
          type Tokens = {
            data: {
              refresh: string,
              access: string,
            },
          }
      
          if (res2.ok) {
            const body = await res2.json() as Tokens;
    
            Http.setTokens(body.data.access, body.data.refresh);

            resolve(true);
          }
          else {
            Http.setTokens(null, null);

            resolve(false);
          }
        });
      }

      // Wait for refresh request to complete.
      const refreshed = await Http.refreshing
      Http.refreshing = null;

      if (refreshed) {
        // If the refresh succeeded then
        // set authorization header and try again.
        headers.set('Authorization', `Bearer ${Http.accessToken}`)

        res = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    const response = new HttpResponse<Res>(res);

    await response.check();

    return response;
  }

  static async patch<Req, Res>(url: string, body: Req): Promise<HttpResponse<Res>> {
    return (
      Http.fetch<Res>(url, Http.jsonHeaders(), {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    )
  }

  static async put<Req, Res>(url: string, body: Req): Promise<HttpResponse<Res>> {
    return (
      Http.fetch<Res>(url, Http.jsonHeaders(), {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    )
  }

  static async get<Res>(url: string): Promise<HttpResponse<Res>> {
    return (
      Http.fetch<Res>(url, Http.defaultHeaders(), {
        method: 'GET',
      })
    )
  }

  static async delete<Res>(url: string): Promise<HttpResponse<Res>> {
    return (
      Http.fetch<Res>(url, Http.defaultHeaders(), {
        method: 'DELETE',
      })
    )
  }

  static async post<Req, Res>(url: string, body?: Req): Promise<HttpResponse<Res>> {
    if (body === undefined) {
      return Http.fetch<Res>(url, Http.defaultHeaders(), {
        method: 'POST',
      });
    }

    return Http.fetch<Res>(url, Http.jsonHeaders(), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async postForm<Res>(url: string, form: FormData): Promise<HttpResponse<Res>> {
    return (
      Http.fetch<Res>(url, Http.jsonHeaders(), {
        method: 'POST',
        body: form,
      })
    )
  }
}

Http.refreshToken = window.localStorage.getItem('token')

export default Http;
