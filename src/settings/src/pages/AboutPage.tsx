import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function AboutPage(): JSX.Element {
  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">About</h1>
        <p className="text-sm text-muted-foreground">Credits and resources.</p>
      </header>
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <img src="../mascot.png" alt="" className="h-16 w-16 shrink-0 object-contain" />
          <div className="space-y-1">
            <CardTitle>Flipper V</CardTitle>
            <CardDescription>
              A floating virtual Flipper Zero that mirrors a real device over WebSerial.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-medium">3D model</div>
            <p className="text-muted-foreground">
              &ldquo;Flipper Zero&rdquo; by{' '}
              <a
                className="text-primary hover:underline"
                href="https://sketchfab.com/blazitt"
                target="_blank"
                rel="noreferrer"
              >
                blazitt
              </a>{' '}
              on{' '}
              <a
                className="text-primary hover:underline"
                href="https://sketchfab.com/3d-models/flipper-zero-f8ad3fdf5f2b485ba46b0ac91626fc76"
                target="_blank"
                rel="noreferrer"
              >
                Sketchfab
              </a>
              . Used under its original Sketchfab license — please check that page for the
              latest terms.
            </p>
          </div>
          <div>
            <div className="font-medium">Project</div>
            <p className="text-muted-foreground">
              Open source. Built with Electron, React, Tailwind, shadcn/ui, and Three.js.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
