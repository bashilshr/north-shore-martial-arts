interface ImportMetaEnv {
  /** Form endpoint that accepts a POST of FormData (e.g. Formspree, Netlify Forms, your own API). */
  readonly PUBLIC_BOOKING_ENDPOINT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
