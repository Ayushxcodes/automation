import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-4">

      <Card>
        <CardContent className="p-4">
          Connected Accounts
          <p className="text-2xl font-bold">0</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          Messages Today
          <p className="text-2xl font-bold">0</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          Active Automations
          <p className="text-2xl font-bold">0</p>
        </CardContent>
      </Card>

    </div>
  )
}