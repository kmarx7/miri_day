export default function AppShell({ children, navigation, fab }) {
  return (
    <div className="min-h-dvh bg-[#F7F7F8] text-[#171717]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[520px] bg-[#F7F7F8]">
        <main className="app-content px-5 pt-safe">{children}</main>
        {fab}
        {navigation}
      </div>
    </div>
  )
}
