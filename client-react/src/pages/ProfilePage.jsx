import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'

export default function ProfilePage() {
  // TODO: Integrate profile API
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>User details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="you@hospital.org" />
              </div>
              <div>
                <Label>Role</Label>
                <Input placeholder="Neurologist" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Notification email</Label>
                <Input type="email" placeholder="alerts@hospital.org" />
              </div>
              <div>
                <Label>Signature</Label>
                <Textarea rows={4} placeholder="Best regards, Dr. Jane Doe" />
              </div>
              <div className="flex justify-end">
                <Button variant="outline">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
