import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Row,
  Stack,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import apiService from "../../services/api.service";
import { ICON_IDS, ThemeIcon } from "../../common/themeIcons";
import {
  defaultChromePrefs,
  defaultConnectPrefs,
  defaultMobileLayout,
  editorStateFromXML,
  fetchXML,
  injectThemeCSS,
  parseXMLString,
  themeXMLFromEditor,
  transformToText,
} from "../../common/xslt";
import { useShellTheme } from "../../common/ThemeContext";

const COLOR_KEYS = [
  "background1",
  "background2",
  "foreground1",
  "foreground2",
  "foreground3",
  "action",
  "accept",
  "reject",
];

const NAV_IDS = ["documents", "integrations", "connect", "screenshare", "admin"];

const CHROME_STYLES = [
  { value: "flat", label: "Flat (default bar)" },
  { value: "folders", label: "File folders" },
  { value: "outlines", label: "Folder outlines" },
  { value: "tabbed", label: "Tabbed folders (At Ease)" },
];

const GAUGE_TYPES = [
  { value: "circle", label: "Circle" },
  { value: "arc", label: "Arc" },
  { value: "bar", label: "Bar" },
  { value: "none", label: "None (timer text only)" },
];

const PROMPT_LOCATIONS = ["above", "below", "left", "right"];
const PROMPT_STYLES = ["plain", "boxed", "pill", "banner"];
const FONT_FAMILIES = [
  { value: "system", label: "System" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
  { value: "rounded", label: "Rounded" },
];
const FONT_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

function blankEditor(id = "custom") {
  const base = editorStateFromXML(`<?xml version="1.0"?>
<theme id="${id}" name="Custom" published="false">
  <colors background1="#212529" background2="#0f0f0f" foreground1="#f8f7f6" foreground2="#e8e3d9" foreground3="#e4dbaf" action="#EE7B30" accept="#00e676" reject="#ff1744"/>
  <icons brand="cloud" documents="folder" integrations="puzzle" connect="link" screenshare="display" admin="gear" profile="person"/>
  <layout>
    <nav brand-position="start" user-menu="end">
      <item id="documents" visible="true"/>
      <item id="integrations" visible="true"/>
      <item id="connect" visible="true"/>
      <item id="screenshare" visible="true"/>
      <item id="admin" visible="true" admin-only="true"/>
    </nav>
    <login primary-button="end" passkey-button="start" show-brand="true"/>
  </layout>
</theme>`);
  return {
    ...base,
    chrome: defaultChromePrefs(),
    connect: defaultConnectPrefs(),
    mobile: defaultMobileLayout(),
  };
}

function hexOr(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export default function ThemeStudio() {
  const { reload: reloadActiveTheme, formFactor: liveFormFactor } = useShellTheme();
  const [list, setList] = useState([]);
  const [editor, setEditor] = useState(() => blankEditor());
  const [layoutTarget, setLayoutTarget] = useState("desktop");
  const [error, setError] = useState(null);
  const [cssXsl, setCssXsl] = useState(null);
  const [saving, setSaving] = useState(false);

  const activeNav = layoutTarget === "mobile" ? editor.mobile.nav : editor.nav;
  const activeLogin = layoutTarget === "mobile" ? editor.mobile.login : editor.login;
  const activeConnect = layoutTarget === "mobile" ? editor.mobile.connect : editor.connect;
  const activeChrome = layoutTarget === "mobile" ? editor.mobile.chrome : editor.chrome;

  const setActiveNav = (nav) => {
    if (layoutTarget === "mobile") {
      setEditor((prev) => ({ ...prev, mobile: { ...prev.mobile, nav } }));
    } else {
      setEditor((prev) => ({ ...prev, nav }));
    }
  };
  const setActiveLogin = (login) => {
    if (layoutTarget === "mobile") {
      setEditor((prev) => ({ ...prev, mobile: { ...prev.mobile, login } }));
    } else {
      setEditor((prev) => ({ ...prev, login }));
    }
  };
  const setActiveConnect = (connect) => {
    if (layoutTarget === "mobile") {
      setEditor((prev) => ({ ...prev, mobile: { ...prev.mobile, connect } }));
    } else {
      setEditor((prev) => ({ ...prev, connect }));
    }
  };
  const setActiveChrome = (chrome) => {
    if (layoutTarget === "mobile") {
      setEditor((prev) => ({ ...prev, mobile: { ...prev.mobile, chrome } }));
    } else {
      setEditor((prev) => ({ ...prev, chrome }));
    }
  };

  const refreshList = useCallback(() => {
    return apiService
      .listThemes()
      .then(setList)
      .catch((e) => setError(String(e.message || e)));
  }, []);

  useEffect(() => {
    refreshList();
    fetchXML("/ui/api/themes/assets/theme-to-css.xsl")
      .then(setCssXsl)
      .catch((e) => setError(String(e.message || e)));
  }, [refreshList]);

  const previewCSS = useMemo(() => {
    if (!cssXsl) return "";
    try {
      const xml = themeXMLFromEditor(editor);
      const doc = parseXMLString(xml);
      return transformToText(doc, cssXsl);
    } catch {
      return "";
    }
  }, [editor, cssXsl]);

  useEffect(() => {
    if (previewCSS) injectThemeCSS(previewCSS);
  }, [previewCSS]);

  function updateColor(key, value) {
    setEditor((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }

  function updateIcon(key, value) {
    setEditor((prev) => ({
      ...prev,
      icons: { ...prev.icons, [key]: value },
    }));
  }

  function moveNav(index, dir) {
    const items = [...activeNav.items];
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    [items[index], items[j]] = [items[j], items[index]];
    setActiveNav({ ...activeNav, items });
  }

  function toggleNav(index, field) {
    const items = activeNav.items.map((it, i) =>
      i === index ? { ...it, [field]: !it[field] } : it
    );
    setActiveNav({ ...activeNav, items });
  }

  async function loadTheme(id) {
    try {
      const t = await apiService.getTheme(id);
      setEditor(editorStateFromXML(t.xml));
      setError(null);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const xml = themeXMLFromEditor(editor);
      await apiService.saveTheme({
        id: editor.id,
        name: editor.name,
        published: editor.published,
        xml,
      });
      toast.success("Theme saved");
      await refreshList();
      await reloadActiveTheme();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id, published) {
    try {
      await apiService.publishTheme(id, published);
      toast.success(published ? "Published" : "Unpublished");
      await refreshList();
    } catch (e) {
      toast.error(String(e.message || e));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Delete theme ${id}?`)) return;
    try {
      await apiService.deleteTheme(id);
      toast.success("Deleted");
      await refreshList();
      if (editor.id === id) setEditor(blankEditor());
    } catch (e) {
      toast.error(String(e.message || e));
    }
  }

  return (
    <Container fluid className="py-3" style={{ overflow: "auto", height: "100%" }}>
      <Stack gap={3}>
        <div>
          <Link to="/admin">← Admin</Link>
          <h1 className="h3 mt-2">Theme studio</h1>
          <p className="text-muted mb-0">
            Edit shell XML themes. Mobile layout is chosen from the client&apos;s HTTP headers
            (<code>Sec-CH-UA-Mobile</code> / <code>User-Agent</code>
            {liveFormFactor ? <> — this session: <strong>{liveFormFactor}</strong></> : null}).
          </p>
        </div>
        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Row>
          <Col md={4}>
            <h2 className="h5">Themes</h2>
            <Table size="sm" hover>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <button type="button" className="btn btn-link p-0" onClick={() => loadTheme(t.id)}>
                        {t.name}
                      </button>
                      <div className="small text-muted">{t.id}</div>
                    </td>
                    <td>{t.published ? "Published" : "Draft"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="me-1"
                        onClick={() => handlePublish(t.id, !t.published)}
                      >
                        {t.published ? "Unpublish" : "Publish"}
                      </Button>
                      {!t.builtin ? (
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(t.id)}>
                          Delete
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button
              variant="secondary"
              onClick={() => setEditor(blankEditor(`theme-${Date.now().toString(36).slice(-6)}`))}
            >
              New theme
            </Button>
          </Col>

          <Col md={8}>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label htmlFor="theme-id">ID</Form.Label>
                    <Form.Control
                      id="theme-id"
                      value={editor.id}
                      onChange={(e) =>
                        setEditor({ ...editor, id: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label htmlFor="theme-name">Name</Form.Label>
                    <Form.Control
                      id="theme-name"
                      value={editor.name}
                      onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    id="theme-published"
                    label="Published"
                    checked={editor.published}
                    onChange={(e) => setEditor({ ...editor, published: e.target.checked })}
                  />
                </Col>
              </Row>

              <h2 className="h5">Colors</h2>
              <Row className="mb-3">
                {COLOR_KEYS.map((key) => (
                  <Col key={key} xs={6} md={3} className="mb-2">
                    <Form.Label htmlFor={`color-${key}`}>{key}</Form.Label>
                    <Form.Control
                      id={`color-${key}`}
                      type="color"
                      value={hexOr(editor.colors[key], "#212529")}
                      onChange={(e) => updateColor(key, e.target.value)}
                    />
                  </Col>
                ))}
              </Row>

              <h2 className="h5">Icons</h2>
              <Row className="mb-3">
                {Object.keys(editor.icons).map((key) => (
                  <Col key={key} xs={6} md={4} className="mb-2">
                    <Form.Label htmlFor={`icon-${key}`}>
                      <ThemeIcon name={editor.icons[key]} /> {key}
                    </Form.Label>
                    <Form.Select
                      id={`icon-${key}`}
                      value={editor.icons[key]}
                      onChange={(e) => updateIcon(key, e.target.value)}
                    >
                      {ICON_IDS.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                ))}
              </Row>

              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <h2 className="h5 mb-0">Layout</h2>
                <ButtonGroup aria-label="Layout target">
                  <Button
                    type="button"
                    variant={layoutTarget === "desktop" ? "primary" : "outline-secondary"}
                    onClick={() => setLayoutTarget("desktop")}
                  >
                    Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={layoutTarget === "mobile" ? "primary" : "outline-secondary"}
                    onClick={() => setLayoutTarget("mobile")}
                  >
                    Mobile
                  </Button>
                </ButtonGroup>
                <span className="small text-muted">
                  Editing {layoutTarget} layout (served when headers resolve to that form factor)
                </span>
              </div>

              <h3 className="h6">Chrome style ({layoutTarget})</h3>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Label htmlFor="chrome-style">Look</Form.Label>
                  <Form.Select
                    id="chrome-style"
                    value={activeChrome?.style || "flat"}
                    onChange={(e) => setActiveChrome({ ...activeChrome, style: e.target.value })}
                  >
                    {CHROME_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              {(activeChrome?.style || "flat") !== "flat" ? (
                <Row className="mb-3">
                  {[
                    ["folderColor", "Folder"],
                    ["tabColor", "Tab"],
                    ["outlineColor", "Outline"],
                    ["drawerColor", "Drawer"],
                    ["labelColor", "Label text"],
                  ].map(([key, label]) => (
                    <Col key={key} xs={6} md={2} className="mb-2">
                      <Form.Label htmlFor={`chrome-${layoutTarget}-${key}`}>{label}</Form.Label>
                      <Form.Control
                        id={`chrome-${layoutTarget}-${key}`}
                        type="color"
                        value={hexOr(activeChrome?.[key], "#d4b483")}
                        onChange={(e) => setActiveChrome({ ...activeChrome, [key]: e.target.value })}
                      />
                    </Col>
                  ))}
                </Row>
              ) : null}

              <h3 className="h6">Navigation ({layoutTarget})</h3>
              <Row className="mb-2">
                <Col md={4}>
                  <Form.Label htmlFor="brand-pos">Brand position</Form.Label>
                  <Form.Select
                    id="brand-pos"
                    value={activeNav.brandPosition}
                    onChange={(e) => setActiveNav({ ...activeNav, brandPosition: e.target.value })}
                  >
                    <option value="start">Start</option>
                    <option value="end">End</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label htmlFor="user-menu">User menu</Form.Label>
                  <Form.Select
                    id="user-menu"
                    value={activeNav.userMenu}
                    onChange={(e) => setActiveNav({ ...activeNav, userMenu: e.target.value })}
                  >
                    <option value="end">End</option>
                    <option value="start">Start</option>
                  </Form.Select>
                </Col>
              </Row>
              <Table size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Visible</th>
                    <th scope="col">Admin only</th>
                    <th scope="col">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {activeNav.items.map((it, index) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          aria-label={`${it.id} visible`}
                          checked={it.visible !== false}
                          onChange={() => toggleNav(index, "visible")}
                        />
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          aria-label={`${it.id} admin only`}
                          checked={Boolean(it.adminOnly)}
                          onChange={() => toggleNav(index, "adminOnly")}
                          disabled={it.id !== "admin" && !NAV_IDS.includes(it.id)}
                        />
                      </td>
                      <td>
                        <Button size="sm" variant="outline-secondary" className="me-1" type="button" onClick={() => moveNav(index, -1)}>
                          Up
                        </Button>
                        <Button size="sm" variant="outline-secondary" type="button" onClick={() => moveNav(index, 1)}>
                          Down
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <h3 className="h6">Login buttons ({layoutTarget})</h3>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label htmlFor="primary-btn">Primary (Login) position</Form.Label>
                  <Form.Select
                    id="primary-btn"
                    value={activeLogin.primaryButton}
                    onChange={(e) => setActiveLogin({ ...activeLogin, primaryButton: e.target.value })}
                  >
                    <option value="end">End</option>
                    <option value="start">Start</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label htmlFor="passkey-btn">Passkey button position</Form.Label>
                  <Form.Select
                    id="passkey-btn"
                    value={activeLogin.passkeyButton}
                    onChange={(e) => setActiveLogin({ ...activeLogin, passkeyButton: e.target.value })}
                  >
                    <option value="start">Start</option>
                    <option value="end">End</option>
                  </Form.Select>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    id="show-brand"
                    label="Show brand on login"
                    checked={activeLogin.showBrand !== false}
                    onChange={(e) => setActiveLogin({ ...activeLogin, showBrand: e.target.checked })}
                  />
                </Col>
              </Row>

              <h3 className="h6">Connect screen ({layoutTarget})</h3>
              <Row className="mb-2">
                <Col md={4}>
                  <Form.Label htmlFor="gauge-type">Gauge type</Form.Label>
                  <Form.Select
                    id="gauge-type"
                    value={activeConnect.gaugeType}
                    onChange={(e) => setActiveConnect({ ...activeConnect, gaugeType: e.target.value })}
                  >
                    {GAUGE_TYPES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label htmlFor="prompt-loc">Prompt location</Form.Label>
                  <Form.Select
                    id="prompt-loc"
                    value={activeConnect.promptLocation}
                    onChange={(e) => setActiveConnect({ ...activeConnect, promptLocation: e.target.value })}
                  >
                    {PROMPT_LOCATIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label htmlFor="prompt-style">Prompt style</Form.Label>
                  <Form.Select
                    id="prompt-style"
                    value={activeConnect.promptStyle}
                    onChange={(e) => setActiveConnect({ ...activeConnect, promptStyle: e.target.value })}
                  >
                    {PROMPT_STYLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={4}>
                  <Form.Label htmlFor="font-family">Font</Form.Label>
                  <Form.Select
                    id="font-family"
                    value={activeConnect.fontFamily}
                    onChange={(e) => setActiveConnect({ ...activeConnect, fontFamily: e.target.value })}
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label htmlFor="font-size">Size</Form.Label>
                  <Form.Select
                    id="font-size"
                    value={activeConnect.fontSize}
                    onChange={(e) => setActiveConnect({ ...activeConnect, fontSize: e.target.value })}
                  >
                    {FONT_SIZES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              <Row className="mb-3">
                {[
                  ["trackColor", "Gauge track"],
                  ["fillColor", "Gauge fill"],
                  ["textColor", "Gauge text"],
                  ["promptBg", "Prompt background"],
                  ["promptFg", "Prompt text"],
                  ["promptBorder", "Prompt border"],
                  ["codeColor", "Code color"],
                ].map(([key, label]) => (
                  <Col key={key} xs={6} md={3} className="mb-2">
                    <Form.Label htmlFor={`connect-${layoutTarget}-${key}`}>{label}</Form.Label>
                    <Form.Control
                      id={`connect-${layoutTarget}-${key}`}
                      type="color"
                      value={hexOr(activeConnect[key], "#EE7B30")}
                      onChange={(e) => setActiveConnect({ ...activeConnect, [key]: e.target.value })}
                    />
                  </Col>
                ))}
              </Row>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save theme"}
              </Button>
            </Form>

            <details className="mt-3">
              <summary>Generated XML</summary>
              <pre style={{ maxHeight: 240, overflow: "auto" }}>{themeXMLFromEditor(editor)}</pre>
            </details>
          </Col>
        </Row>
      </Stack>
    </Container>
  );
}
