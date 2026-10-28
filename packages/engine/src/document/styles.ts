import { StyleSheet } from '@react-pdf/renderer';
import type { CvTheme } from '../schema';

/** Width of the sidebar column (layout `sidebar`) in points; A4 is 595 × 842 pt. */
export const SIDEBAR_WIDTH = 190;
const PAGE_X = 36;
const PAGE_Y = 40;

/**
 * @param fallbackFont Registered font family for characters the standard fonts lack. react-pdf picks the first
 *   family in the list that has a glyph, character by character, so regular text keeps the theme's font.
 */
export function createStyles(theme: CvTheme, fallbackFont?: string) {
  const { colors } = theme;
  const font = fallbackFont ? [theme.font, fallbackFont] : theme.font;
  const sidebar = theme.layout === 'sidebar';

  return StyleSheet.create({
    page: {
      paddingTop: PAGE_Y,
      paddingBottom: PAGE_Y + 12,
      paddingHorizontal: PAGE_X,
      paddingLeft: sidebar ? SIDEBAR_WIDTH + 28 : PAGE_X,
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: font,
      fontSize: 9.5,
    },
    // Line height lives here and not on the page: on the page it hides every `render` text (react-pdf 4.9).
    // A unitless line height is resolved against the font size of the same node, so it needs one too.
    content: {
      fontSize: 9.5,
      lineHeight: 1.4,
    },
    // Repeated on every page, behind the content.
    sidebarBackground: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: colors.sidebar,
    },
    sidebar: {
      position: 'absolute',
      top: PAGE_Y,
      left: 22,
      width: SIDEBAR_WIDTH - 44,
      color: colors.sidebarText,
      fontSize: 8.5,
      lineHeight: 1.4,
    },
    sidebarHeading: {
      marginTop: 18,
      marginBottom: 6,
      paddingBottom: 3,
      borderBottomWidth: 0.75,
      borderBottomColor: colors.sidebarText,
      fontSize: 8.5,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    sidebarItem: {
      marginBottom: 4,
    },
    sidebarLink: {
      color: colors.sidebarText,
      textDecoration: 'none',
    },
    photo: {
      width: SIDEBAR_WIDTH - 44,
      height: SIDEBAR_WIDTH - 44,
      marginBottom: 6,
      borderRadius: (SIDEBAR_WIDTH - 44) / 2,
      objectFit: 'cover',
    },
    photoClassic: {
      width: 78,
      height: 78,
      borderRadius: 39,
      objectFit: 'cover',
    },

    // ── Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      marginBottom: 6,
    },
    name: {
      fontSize: 26,
      fontWeight: 'bold',
      lineHeight: 1.15,
      color: colors.primary,
    },
    headline: {
      marginTop: 4,
      fontSize: 12,
      color: colors.muted,
    },
    contactLine: {
      marginTop: 8,
      fontSize: 8.5,
      color: colors.muted,
    },
    // Nested <Text> ignores margins, so the separator carries its own spaces.
    contactSeparator: {
      color: colors.accent,
    },

    // ── Sections
    section: {
      marginTop: 16,
    },
    sectionHeading: {
      marginBottom: 8,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.primary,
    },
    paragraph: {
      color: colors.text,
    },
    muted: {
      color: colors.muted,
    },
    link: {
      color: colors.accent,
      textDecoration: 'none',
    },

    // ── Timeline
    station: {
      flexDirection: 'row',
    },
    rail: {
      width: 14,
      alignItems: 'center',
    },
    dot: {
      width: 7,
      height: 7,
      marginTop: 3,
      borderRadius: 3.5,
      borderWidth: 1.5,
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    dotHollow: {
      backgroundColor: colors.background,
    },
    line: {
      flexGrow: 1,
      width: 1,
      marginVertical: 2,
      backgroundColor: colors.primary,
      opacity: 0.25,
    },
    stationBody: {
      flex: 1,
      paddingLeft: 6,
      paddingBottom: 10,
    },
    period: {
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.4,
      color: colors.accent,
    },
    stationTitle: {
      fontSize: 10.5,
      fontWeight: 'bold',
      color: colors.primary,
    },
    highlight: {
      flexDirection: 'row',
      marginTop: 1,
    },
    bullet: {
      width: 9,
      color: colors.accent,
    },

    // ── Lists
    entry: {
      marginBottom: 6,
    },
    entryTitle: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    tags: {
      marginTop: 1,
      fontSize: 8,
      color: colors.muted,
    },
    skillGroup: {
      marginBottom: 5,
    },
    skillName: {
      fontWeight: 'bold',
    },
    twoColumns: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 18,
    },
    column: {
      width: '47%',
    },

    footer: {
      position: 'absolute',
      bottom: 20,
      left: sidebar ? SIDEBAR_WIDTH + 28 : PAGE_X,
      right: PAGE_X,
      textAlign: 'right',
      fontSize: 7.5,
      color: colors.muted,
    },
  });
}

export type CvStyles = ReturnType<typeof createStyles>;
