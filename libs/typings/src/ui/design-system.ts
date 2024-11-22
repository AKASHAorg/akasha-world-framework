import * as HeroIcons from '@heroicons/react/24/outline';

/**
 * Type defining colors used in design system
 **/
export type Colors =
  | 'transparent'
  | 'primary'
  | 'primaryStart'
  | 'primaryStop'
  | 'secondaryLight'
  | 'secondaryDark'
  | 'tertiaryLight'
  | 'tertiaryDark'
  | 'black'
  | 'white'
  | 'grey1'
  | 'grey2'
  | 'grey3'
  | 'grey4'
  | 'grey5'
  | 'grey6'
  | 'grey7'
  | 'grey8'
  | 'grey9'
  | 'success'
  | 'warningLight'
  | 'warningDark'
  | 'errorLight'
  | 'errorDark'
  | 'errorDark2'
  | 'errorFade'
  | 'blue'
  | 'red'
  | 'orange'
  | 'self-color'
  | `primary/${number}`
  | `primaryStart/${number}`
  | `primaryStop/${number}`
  | `secondaryLight/${number}`
  | `secondaryDark/${number}`
  | `black/${number}`
  | `white/${number}`
  | `grey1/${number}`
  | `grey2/${number}`
  | `grey3/${number}`
  | `grey4/${number}`
  | `grey5/${number}`
  | `grey6/${number}`
  | `grey7/${number}`
  | `grey8/${number}`
  | `grey9/${number}`
  | `success/${number}`
  | `warningLight/${number}`
  | `warningDark/${number}`
  | `errorLight/${number}`
  | `errorDark/${number}`
  | `errorDark2/${number}`
  | `errorFade/${number}`
  | `blue-${number}`
  | `red-${number}`
  | `orange-${number}`;

/**
 * Type defining icon types used in design system
 **/
export type IconType =
  | keyof typeof HeroIcons
  | 'Akasha'
  | 'AlignCenter'
  | 'AlignLeft'
  | 'AlignRight'
  | 'AlignJustify'
  | 'Antenna'
  | 'Bold'
  | 'DidKey'
  | 'Discord'
  | 'Eth'
  | 'Faq'
  | 'Following'
  | 'Github'
  | 'info-light'
  | 'IntegrationAppCTA'
  | 'Italic'
  | 'LicenseWtfpl'
  | 'LicenseAllRights'
  | 'LicenseAttribution'
  | 'LicenseNoDerivatives'
  | 'LicenseNoRights'
  | 'LicenseNonCommercial'
  | 'LicenseShareAlike'
  | 'LicenseSomeRights'
  | 'ListNumbered'
  | 'ListBulleted'
  | 'LockDark'
  | 'LockLight'
  | 'Metamask'
  | 'NoEth'
  | 'Plugin'
  | 'Shield'
  | 'Strikethrough'
  | 'Solana'
  | 'Telegram'
  | 'TextIcon'
  | 'TextcaseLower'
  | 'TextcaseSentence'
  | 'TextcaseUpper'
  | 'Twitter'
  | 'Underline'
  | 'Vibe'
  | 'Walletconnect'
  | 'Widget';
