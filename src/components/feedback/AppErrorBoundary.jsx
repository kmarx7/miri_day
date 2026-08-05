import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-dvh place-items-center bg-[#F7F7F8] px-5 pt-safe pb-safe" role="main">
        <section className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 text-center" role="alert">
          <p className="text-3xl" aria-hidden="true">!</p>
          <h1 className="mt-3 text-xl font-extrabold">앱을 다시 열어 주세요</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">기기에 저장된 데이터는 그대로 유지돼요.</p>
          <button
            type="button"
            onClick={() => globalThis.location?.reload()}
            className="mt-5 min-h-12 w-full rounded-xl bg-black px-4 text-sm font-bold text-white"
          >
            다시 불러오기
          </button>
        </section>
      </main>
    )
  }
}
