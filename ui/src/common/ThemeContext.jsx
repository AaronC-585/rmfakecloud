import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuthState } from "./useAuthContext";
import apiService from "../services/api.service";
import {
  applyColorOverrides,
  applyFormFactor,
  defaultLayout,
  fetchXML,
  injectThemeCSS,
  parseLayoutDocument,
  parseXMLString,
  transformToText,
  transformWithXSLT,
} from "./xslt";

const ThemeContext = createContext({
  layout: defaultLayout(),
  themeId: "default",
  formFactor: "desktop",
  colorOverrides: {},
  loading: true,
  reload: () => {},
  applyThemeId: async () => {},
});

export function useShellTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const { state: { user } } = useAuthState();
  const [layout, setLayout] = useState(defaultLayout());
  const [themeId, setThemeId] = useState("default");
  const [formFactor, setFormFactor] = useState("desktop");
  const [colorOverrides, setColorOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [xslCache, setXslCache] = useState(null);

  const loadXsl = useCallback(async () => {
    if (xslCache) return xslCache;
    const [cssXsl, layoutXsl] = await Promise.all([
      fetchXML("/ui/api/themes/assets/theme-to-css.xsl"),
      fetchXML("/ui/api/themes/assets/theme-to-layout.xsl"),
    ]);
    const cache = { cssXsl, layoutXsl };
    setXslCache(cache);
    return cache;
  }, [xslCache]);

  const applyThemeXML = useCallback(
    async (xmlString, overrides = {}, factor = "desktop") => {
      try {
        const { cssXsl, layoutXsl } = await loadXsl();
        let themeDoc = parseXMLString(xmlString);
        themeDoc = applyColorOverrides(themeDoc, overrides);
        themeDoc = applyFormFactor(themeDoc, factor);
        const css = transformToText(themeDoc, cssXsl);
        injectThemeCSS(css);
        const layoutDoc = transformWithXSLT(themeDoc, layoutXsl);
        const parsed = parseLayoutDocument(layoutDoc);
        parsed.formFactor = factor;
        setLayout(parsed);
        setFormFactor(factor);
      } catch (e) {
        console.warn("theme apply failed, using default layout", e);
        setLayout(defaultLayout());
      }
    },
    [loadXsl]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      let tid = "default";
      let overrides = {};
      let factor = "desktop";
      if (user) {
        try {
          const pref = await apiService.getProfileTheme();
          tid = pref.themeId || "default";
          overrides = pref.themeColorOverrides || {};
          if (pref.formFactor) factor = pref.formFactor;
        } catch (_) {
          /* stay default */
        }
      }
      const theme = await apiService.getTheme(tid);
      if (theme.formFactor) factor = theme.formFactor;
      setThemeId(tid);
      setColorOverrides(overrides);
      await applyThemeXML(theme.xml, overrides, factor);
    } catch (e) {
      console.warn(e);
      setThemeId("default");
      setLayout(defaultLayout());
    } finally {
      setLoading(false);
    }
  }, [user, applyThemeXML]);

  const applyThemeId = useCallback(
    async (id, overrides = colorOverrides) => {
      const theme = await apiService.getTheme(id);
      const factor = theme.formFactor || formFactor || "desktop";
      setThemeId(id);
      setColorOverrides(overrides || {});
      await applyThemeXML(theme.xml, overrides || {}, factor);
    },
    [applyThemeXML, colorOverrides, formFactor]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      layout,
      themeId,
      formFactor,
      colorOverrides,
      loading,
      reload,
      applyThemeId,
      applyThemeXML,
      setColorOverrides,
    }),
    [layout, themeId, formFactor, colorOverrides, loading, reload, applyThemeId, applyThemeXML]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
