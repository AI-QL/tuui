import { createVuetify } from 'vuetify'
import { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl } from 'vuetify/locale'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
import { VTreeview } from 'vuetify/labs/VTreeview'
import { VIconBtn } from 'vuetify/labs/VIconBtn'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.min.css'

import colors from 'vuetify/lib/util/colors'

export default createVuetify({
  locale: {
    messages: { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl },
    locale: 'en',
    fallback: 'en'
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  components: {
    VFileUpload,
    VTreeview,
    VIconBtn
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.blue.darken3, // #1565C0
          secondary: colors.indigo.darken3 // #283593
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: colors.indigo.darken2, // #303F9F
          secondary: colors.indigo.darken4 // #1A237E
        }
      }
    }
  }
})
