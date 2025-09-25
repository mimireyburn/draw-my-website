// ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
export class ErrorBoundary extends Component<{children: ReactNode},{err?:Error}> {
  state = { err: undefined as Error | undefined }
  static getDerivedStateFromError(err: Error) { return { err } }
  componentDidCatch(err: Error) { console.error(err) }
  render() { return this.state.err ? <pre style={{padding:16,whiteSpace:'pre-wrap'}}>{String(this.state.err)}</pre> : this.props.children }
}
