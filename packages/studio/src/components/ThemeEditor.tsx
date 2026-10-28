import {
  contrastRatio,
  FONTS,
  LAYOUTS,
  MIN_TEXT_CONTRAST,
  themeContrastPairs,
  themePresets,
  type CvTheme,
  type ThemePresetId,
} from '@scorrrpy/cv-engine';
import { useId } from 'react';
import { useStudio } from './StudioContext';
import styles from './studio.module.css';

type ColorKey = keyof CvTheme['colors'];

/** The "Design" tab: presets, colours with a contrast check, font, layout. */
export function ThemeEditor() {
  const { state, dispatch, ui } = useStudio();
  const { theme } = state;
  const id = useId();
  const setTheme = (next: Partial<CvTheme>) => dispatch({ type: 'theme', theme: { ...theme, ...next } });

  const colorKeys = (Object.keys(theme.colors) as ColorKey[]).filter(
    (key) => theme.layout === 'sidebar' || (key !== 'sidebar' && key !== 'sidebarText'),
  );
  const warnings = themeContrastPairs(theme)
    .map((pair) => ({ ...pair, ratio: contrastRatio(pair.foreground, pair.background) }))
    .filter((pair) => pair.ratio < MIN_TEXT_CONTRAST);
  const numberFormat = new Intl.NumberFormat(ui.intl, { maximumFractionDigits: 1 });

  return (
    <div className={styles.sections}>
      <fieldset className={styles.section}>
        <legend>{ui.design.presets}</legend>
        <div className={styles.presets}>
          {(Object.keys(themePresets) as ThemePresetId[]).map((presetId) => {
            const preset = themePresets[presetId];
            return (
              <button
                key={presetId}
                type="button"
                className={styles.preset}
                onClick={() => setTheme({ ...preset, showPhoto: theme.showPhoto })}
              >
                <span className={styles.swatches} aria-hidden="true">
                  {[preset.colors.sidebar, preset.colors.primary, preset.colors.accent].map((color, index) => (
                    <span key={index} style={{ background: color }} />
                  ))}
                </span>
                {ui.design.presetNames[presetId]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>{ui.design.colors}</legend>
        <div className={styles.colors}>
          {colorKeys.map((key) => (
            <label key={key} className={styles.color}>
              <input
                type="color"
                value={theme.colors[key]}
                onChange={(event) => setTheme({ colors: { ...theme.colors, [key]: event.target.value } })}
              />
              <span>{ui.design.colorNames[key]}</span>
            </label>
          ))}
        </div>
        {warnings.length > 0 && (
          <ul className={styles.warnings} role="status">
            {warnings.map((warning) => (
              <li key={warning.id}>
                {ui.design.contrast(ui.design.colorNames[warning.id as ColorKey], numberFormat.format(warning.ratio))}
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className={styles.section}>
        <legend>{ui.design.layout}</legend>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={`${id}-layout`}>{ui.design.layout}</label>
            <select
              id={`${id}-layout`}
              value={theme.layout}
              onChange={(event) => setTheme({ layout: event.target.value as CvTheme['layout'] })}
            >
              {LAYOUTS.map((layout) => (
                <option key={layout} value={layout}>
                  {ui.design.layouts[layout]}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-font`}>{ui.design.font}</label>
            <select
              id={`${id}-font`}
              value={theme.font}
              onChange={(event) => setTheme({ font: event.target.value as CvTheme['font'] })}
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {ui.design.fonts[font]}
                </option>
              ))}
            </select>
          </div>
          <label className={`${styles.checkbox} ${styles.wide}`}>
            <input
              type="checkbox"
              checked={theme.showPhoto}
              onChange={(event) => setTheme({ showPhoto: event.target.checked })}
            />
            {ui.design.showPhoto}
          </label>
        </div>
      </fieldset>
    </div>
  );
}
