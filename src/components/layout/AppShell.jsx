export default function AppShell({ children, navigation, fab }) {
  return (
    <div className="app-ground min-h-dvh">
      <div className="app-canvas relative mx-auto min-h-dvh w-full max-w-[520px]">
        <main className="app-content px-5 pt-safe">{children}</main>
        {fab}
        {navigation}
      </div>
    </div>
  )
}
