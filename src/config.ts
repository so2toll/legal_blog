import type { MarkdownInstance } from 'astro'

export interface Frontmatter {
  draft?: boolean
  title: string
  description?: string
  author?: string
  publishDate: string
  coverSVG?: string
  coverImage?: string
  socialImage?: string
  categories?: string[]
  tags?: string[]
  file?: string
  url?: string
  minutesRead?: string
  extra?: string[]
  section?: string[]
}

export interface TagType {
  tag: string
  count: number
  pages: MarkdownInstance<Frontmatter>[]
}

export const SiteMetadata = {
  title: 'Claims Advocacy',
  description: 'Use our inmate search and stay connected with your loved one. We provide you a simple, affordable way to stay in touch. Use any mobile device or desktop for unlimited calls, photo sharing &amp; more. Try for free.',
  author: {
    name: 'Claims Advocacy',
    twitter: '@Claims Advocacy',
    url: 'https://claims-advocacy.org',
    email: 'info@claims-advocacy.org',
    summary: 'Search and find your inmate in over 4,000 facilities nationwide. A simple, affordable way to stay in touch with your loved one from any device. Send pictures, letters, and more in just a few clicks.',
  },
  org: {
    name: 'Claims Advocacy',
    twitter: '@claims-advocacy.org',
    url: 'https://claims-advocacy.org',
    email: 'info@claims-advocacy.org',
    summary:
      'Use our inmate search and stay connected with your loved one. We provide you a simple, affordable way to stay in touch. Use any mobile device or desktop for unlimited calls, photo sharing &amp; more. Try for free.',
  },
  location: 'Rivendell, Middle Earth',
  latlng: [-33.86785, 151.20732] as [number, number],
  repository: 'https://github.com/victim-assist/hello',
  social: [
    {
      name: 'Email',
      link: 'mailto:info@claims-advocacy.org',
      icon: 'envelope',
    },
    
    {
      name: 'LinkedIn',
      link: 'https://www.linkedin.com/claims-advocacy.org',
      icon: 'linkedin',
    },
    {
      name: 'Facebook',
      link: 'https://www.facebook.com/claims-advocacy.org',
      icon: 'facebook',
    },
    {
      name: 'Instagram',
      link: 'https://www.instagram.com/claims-advocacy.org',
      icon: 'instagram',
    },
    {
      name: 'Twitter',
      link: 'https://twitter.com/claims-advocacy.org',
      icon: 'twitter',
    },
    {
      name: 'Github',
      link: 'https://github.com/claims-advocacy.org',
      icon: 'github',
    },
  ],
  buildTime: new Date().toString(),
}

export const Logo = '../svg/astro/pigLogo.svg'
export const LogoImage = '../images/astro/Claims_AdvocacyLogoWhite.webp'
export const FeaturedSVG = '../svg/undraw/undraw_design_inspiration.svg'
export const FeaturedHowitWorksSVG = '../images/astro/Claims_AdvocacyMainHeader.webp'
export const DefaultSVG = '../svg/undraw/undraw_my_feed.svg'
export const DefaultImage = '../images/astro/Claims_Advocacy_LogoWhite.webp'

export const NavigationLinks = [
  // { name: 'Hodme', href: '' },
  { name: 'Inmate Services', href: '#' },
  { name: 'Pricing', href: 'pricing/' },
  { name: 'How it Works', href: 'how-it-works/' },
  { name: 'Jails & Prisons', href: 'jail-prisons/' },
  { name: 'Blog', href: 'blog/' },
  { name: 'Contact Us', href: 'contact/' },

]

export const CategoryDetail = [
  {
    category: 'instructions',
    coverSVG: '../svg/undraw/undraw_instruction_manual.svg',
    socialImage: '../images/undraw/undraw_instruction_manual.png',
    description: 'Guidelines on using this starter.'
  },
  {
    category: 'information',
    coverSVG: '../svg/undraw/undraw_instant_information.svg',
    socialImage: '../images/undraw/undraw_instant_information.png',
    description: 'Information articles.'
  },
  {
    category: 'information',
    coverSVG: '../svg/undraw/undraw_instant_information.svg',
    socialImage: '../images/undraw/undraw_instant_information.png',
    description: 'Information articles.'
  },
]

export function categoryDetail(category: string | undefined) {
  const details = CategoryDetail.filter(cat => cat.category == category)

  if (details.length == 1) {
    return details[0]
  }
  return {
    category: 'General',
    coverSVG: '../svg/undraw/undraw_instant_information.svg',
    socialImage: '../images/undraw/undraw_instant_information.png',
    description: 'Category ' + category,
  }
}
export const AuthorDetail = [
  {
    name: 'Steven Claims Advocacy',
    description: 'Steven Claims Advocacy',
    contact: 'info@claims-advocacy.org',
    image: '../images/authors/default.jpg'
  }
]

export const DefaultAuthor = {
  name: 'Steven Claims Advocacy',
  image: '../images/authors/default.png',
  contact: 'info@claims-advocacy.org',
  description: 'Steven Claims Advocacy'
}

export function authorDetail(author: string | undefined) {
  const details = AuthorDetail.filter(person => person.name == author)

  if (details.length == 1) {
    return details[0]
  }
  return DefaultAuthor
}

export const PAGE_SIZE = 15

export const GITHUB_EDIT_URL = `https://github.com/victim-assist/hello-astro`

export const COMMUNITY_INVITE_URL = `https://astro.build/chat`

export type Sidebar = Record<string, { text: string; link: string }[]>

export const SIDEBAR: Sidebar = {
  'Section Header': [
    { text: 'Introduction', link: 'doc/introduction' },
    { text: 'Page 2', link: 'doc/page-2' },
    { text: 'Page 3', link: 'doc/page-3' },
  ],
  'Another Section': [{ text: 'Page 4', link: 'doc/page-4' }],
}
