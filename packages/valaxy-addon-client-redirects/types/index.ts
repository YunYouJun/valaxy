export interface RedirectRule {
  to: string
  from: string | string[]
}

export interface ClientRedirectsOptions {
  redirects: RedirectRule[]
}
