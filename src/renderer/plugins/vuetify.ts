import { createVuetify } from 'vuetify'
import { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl } from 'vuetify/locale'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
import { VIconBtn } from 'vuetify/labs/VIconBtn'
import { VTreeview } from 'vuetify/labs/VTreeview'
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
          primary: '#344767',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          secondary: '#2B323B',
          'grey-0': '#F2F5F8',
          'grey-50': '#FAFAFA',
          'grey-100': '#F5F5F5',
          'grey-200': '#EEEEEE',
          'grey-300': '#E0E0E0',
          'grey-400': '#BDBDBD',
          'grey-500': '#9E9E9E',
          'grey-600': '#757575',
          'grey-700': '#616161',
          'grey-800': '#424242',
          'grey-900': '#212121'
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
