import { defineConfig } from 'vite'

function nonBlockingStylesheet() {
  return {
    name: 'non-blocking-stylesheet',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
          (_, href) => `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`
        )
      }
    }
  }
}

export default defineConfig({
  plugins: [nonBlockingStylesheet()],
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'legacy-js-api', 'global-builtin', 'color-functions', 'strict-unary']
      }
    }
  },
  server: {
    open: true,
    port: 3001
  }
})
