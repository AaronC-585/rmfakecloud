import { useEffect, useState } from "react";
import { Alert, Button, Form, Stack } from "react-bootstrap";
import { toast } from "react-toastify";

import apiService from "../../services/api.service";
import { useShellTheme } from "../../common/ThemeContext";

const OVERRIDE_KEYS = [
  { key: "action", label: "Accent" },
  { key: "background1", label: "Background" },
  { key: "foreground1", label: "Text" },
];

export default function ThemePicker() {
  const { themeId, colorOverrides, applyThemeId, reload } = useShellTheme();
  const [themes, setThemes] = useState([]);
  const [selected, setSelected] = useState(themeId || "default");
  const [overrides, setOverrides] = useState(colorOverrides || {});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiService
      .listThemes()
      .then((list) => setThemes(list.filter((t) => t.published)))
      .catch((e) => setError(String(e.message || e)));
  }, []);

  useEffect(() => {
    setSelected(themeId || "default");
    setOverrides(colorOverrides || {});
  }, [themeId, colorOverrides]);

  async function handlePreview() {
    try {
      await applyThemeId(selected, overrides);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiService.putProfileTheme({
        themeId: selected,
        themeColorOverrides: overrides,
      });
      await applyThemeId(selected, overrides);
      await reload();
      toast.success("Theme saved");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="theme-picker-heading">
      <h2 id="theme-picker-heading" className="h5">
        Shell theme
      </h2>
      <p className="text-muted">Choose a published theme. Optional color tweaks apply only for you.</p>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Form onSubmit={handleSave}>
        <Stack gap={3}>
          <Form.Group>
            <Form.Label htmlFor="theme-select">Theme</Form.Label>
            <Form.Select
              id="theme-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              {!themes.find((t) => t.id === "default") ? (
                <option value="default">Default</option>
              ) : null}
            </Form.Select>
          </Form.Group>

          <fieldset>
            <legend className="h6">Color overrides</legend>
            <Stack direction="horizontal" gap={3} className="flex-wrap">
              {OVERRIDE_KEYS.map(({ key, label }) => (
                <Form.Group key={key}>
                  <Form.Label htmlFor={`override-${key}`}>{label}</Form.Label>
                  <Form.Control
                    id={`override-${key}`}
                    type="color"
                    value={
                      overrides[key] && /^#[0-9a-fA-F]{6}$/.test(overrides[key])
                        ? overrides[key]
                        : "#EE7B30"
                    }
                    onChange={(e) =>
                      setOverrides((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    onClick={() =>
                      setOverrides((prev) => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                      })
                    }
                  >
                    Clear
                  </Button>
                </Form.Group>
              ))}
            </Stack>
          </fieldset>

          <div>
            <Button type="button" variant="outline-secondary" className="me-2" onClick={handlePreview}>
              Preview
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save preference"}
            </Button>
          </div>
        </Stack>
      </Form>
    </section>
  );
}
