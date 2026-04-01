import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function IntegrationsPage() {

  const integrations = [
    { name: "Gmail" },
    { name: "WhatsApp" },
    { name: "Claude AI" }
  ]

  return (
    <div className="space-y-4">

      {integrations.map((item) => (

        <Card key={item.name}>
          <CardContent className="flex justify-between p-4">

            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Not connected
              </p>
            </div>

            <Button>
              Connect
            </Button>

          </CardContent>
        </Card>

      ))}

    </div>
  )
}