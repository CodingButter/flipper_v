import { useMemo, useState } from 'react'
import type { Prefs, Theme, ThemeColors } from '../../../shared/types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { cn, slugify } from '../lib/utils'

type Props = {
  prefs: Prefs
  themes: Theme[]
}

const EMPTY_DRAFT: ThemeColors & { name: string } = {
  name: '',
  body: '#dfe1e6',
  accent: '#ff8200',
  trim: '#2a2a2a',
  screen: '#ff8200'
}

export function ThemesPage({ prefs, themes }: Props): JSX.Element {
  const [draft, setDraft] = useState<typeof EMPTY_DRAFT>(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<string | null>(null)

  const builtins = useMemo(() => themes.filter((t) => t.builtin), [themes])
  const custom = useMemo(() => themes.filter((t) => !t.builtin), [themes])

  const activate = (id: string): void => {
    window.flide.prefs.set({ activeThemeId: id })
  }
  const startEdit = (t: Theme): void => {
    setEditingId(t.id)
    setDraft({ name: t.name, body: t.body, accent: t.accent, trim: t.trim, screen: t.screen })
  }
  const startNew = (): void => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
  }
  const save = async (): Promise<void> => {
    if (!draft.name.trim()) return
    const id = editingId ?? slugify(draft.name)
    if (!id) return
    await window.flide.themes.save({
      id,
      name: draft.name.trim(),
      body: draft.body,
      accent: draft.accent,
      trim: draft.trim,
      screen: draft.screen,
      builtin: false
    })
    await window.flide.prefs.set({ activeThemeId: id })
    setEditingId(id)
  }
  const remove = async (id: string): Promise<void> => {
    await window.flide.themes.delete(id)
    if (editingId === id) startNew()
  }
  const duplicate = (t: Theme): void => {
    const name = `${t.name} copy`
    setEditingId(null)
    setDraft({ name, body: t.body, accent: t.accent, trim: t.trim, screen: t.screen })
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Themes</h1>
        <p className="text-sm text-muted-foreground">
          Pick a preset or build your own. Changes apply to the floating Flipper instantly.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Presets</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {builtins.map((t) => (
            <ThemeSwatch
              key={t.id}
              theme={t}
              active={prefs.activeThemeId === t.id}
              onActivate={() => activate(t.id)}
              onDuplicate={() => duplicate(t)}
            />
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Custom themes</h2>
          <Button variant="outline" size="sm" onClick={startNew}>
            New theme
          </Button>
        </div>
        {custom.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No custom themes yet. Build one below and click Save.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {custom.map((t) => (
              <ThemeSwatch
                key={t.id}
                theme={t}
                active={prefs.activeThemeId === t.id}
                onActivate={() => activate(t.id)}
                onEdit={() => startEdit(t)}
                onDelete={() => remove(t.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? `Editing ${draft.name || editingId}` : 'New custom theme'}</CardTitle>
          <CardDescription>
            Tip: the screen color drives the backlight tint behind the live framebuffer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="theme-name">Name</Label>
            <Input
              id="theme-name"
              placeholder="Sunset Orange"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ColorField
              label="Body"
              value={draft.body}
              onChange={(v) => setDraft({ ...draft, body: v })}
            />
            <ColorField
              label="Accent"
              value={draft.accent}
              onChange={(v) => setDraft({ ...draft, accent: v })}
            />
            <ColorField
              label="Trim"
              value={draft.trim}
              onChange={(v) => setDraft({ ...draft, trim: v })}
            />
            <ColorField
              label="Screen"
              value={draft.screen}
              onChange={(v) => setDraft({ ...draft, screen: v })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={startNew}>
              Reset
            </Button>
            <Button onClick={save} disabled={!draft.name.trim()}>
              {editingId ? 'Save changes' : 'Create theme'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ThemeSwatch({
  theme,
  active,
  onActivate,
  onEdit,
  onDelete,
  onDuplicate
}: {
  theme: Theme
  active: boolean
  onActivate: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}): JSX.Element {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-colors',
        active ? 'border-primary' : 'border-border hover:border-muted-foreground'
      )}
    >
      <button
        onClick={onActivate}
        className="block w-full text-left"
        style={{ backgroundColor: theme.body }}
        aria-pressed={active}
      >
        <div className="flex h-20 items-center justify-center" style={{ backgroundColor: theme.body }}>
          <div className="flex gap-1.5">
            <span
              className="h-7 w-9 rounded-sm border"
              style={{ backgroundColor: theme.screen, borderColor: theme.trim }}
            />
            <span
              className="h-7 w-3 rounded-sm"
              style={{ backgroundColor: theme.accent }}
            />
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <div>
          <div className="text-sm font-medium">{theme.name}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {active ? 'Active' : theme.builtin ? 'Preset' : 'Custom'}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDuplicate && (
            <Button size="sm" variant="ghost" onClick={onDuplicate}>
              Copy
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 border-0 px-1 font-mono text-xs"
        />
      </div>
    </div>
  )
}
