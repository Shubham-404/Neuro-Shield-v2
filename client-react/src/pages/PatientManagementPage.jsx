import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input, Label } from '../components/ui/input'
import { Table, T, Th, Td } from '../components/ui/table'
import { Link } from 'react-router-dom'

export default function PatientManagementPage() {
  const [q, setQ] = React.useState('')
  const patients = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Patient #${i + 1}`, age: 40 + i, nihss: 4 + (i % 8), risk: ['Low','Moderate','High'][i % 3] }))
  const filtered = patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))

  // TODO: Integrate API for search/filter, pagination, and bulk actions
  return (
    <Shell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="w-full md:w-72">
                <Label htmlFor="q">Search</Label>
                <Input id="q" value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search patients..." />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Filter</Button>
                <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Export CSV', description: 'Downloading CSV...', } }))}>Export CSV</Button>
                <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Export PDF', description: 'Server-side export coming soon', } }))}>Export PDF</Button>
                <Link to="/assessment"><Button className="bg-indigo-600 hover:bg-indigo-700">Add Patient</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Table>
              <T>
                <thead>
                  <tr>
                    <Th>
                      <input type="checkbox" aria-label="Select all" />
                    </Th>
                    <Th>Name</Th>
                    <Th>Age</Th>
                    <Th>NIHSS</Th>
                    <Th>Risk</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                      <Td><input type="checkbox" aria-label={`Select ${p.name}`} /></Td>
                      <Td>{p.name}</Td>
                      <Td>{p.age}</Td>
                      <Td>{p.nihss}</Td>
                      <Td>{p.risk}</Td>
                      <Td className="text-right">
                        <Link className="text-blue-600 hover:underline" to={`/patients/${p.id}`}>View</Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </T>
            </Table>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filtered.length} of {patients.length}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Prev</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
