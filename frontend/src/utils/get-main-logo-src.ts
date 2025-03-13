import { Theme } from "~/styles/themes"

import { CONSTANTS } from "./constants" 

export const getMainLogoSrc = (theme?: string) => {
  return theme === Theme.Dark ? CONSTANTS.LOGO_FULL_DARK_SRC : CONSTANTS.LOGO_FULL_SRC;
}