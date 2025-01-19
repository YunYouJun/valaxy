import process from 'node:process'

const KNOWN_EXTENSIONS = new Set()

export function treatAsHtml(filename: string): boolean {
  if (KNOWN_EXTENSIONS.size === 0) {
    const extraExts
      = (typeof process === 'object' && process.env.VITE_EXTRA_EXTENSIONS)
        || process.env?.VITE_EXTRA_EXTENSIONS
        || ''

    // md, html? are intentionally omitted
    ;(
      `3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,`
      + `doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,`
      + `man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,`
      + `opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,`
      + `tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,`
      + `yaml,yml,zip${
        extraExts && typeof extraExts === 'string' ? `,${extraExts}` : ''}`
    )
      .split(',')
      .forEach(ext => KNOWN_EXTENSIONS.add(ext))
  }

  const ext = filename.split('.').pop()

  return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase())
}
