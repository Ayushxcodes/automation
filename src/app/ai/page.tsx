import ChatClient from "./ChatClient"

export default function AIPage() {
  // Server component: render the static shell and mount the interactive client
  return (
    <div className="flex h-screen">
      <ChatClient />
    </div>
  )
}
