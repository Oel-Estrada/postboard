import { messages } from './i18n/messages'

/**
 * Root component of Postboard.
 *
 * @returns The application shell.
 */
function App() {
  return <h1>{messages.app.title}</h1>
}

export default App
