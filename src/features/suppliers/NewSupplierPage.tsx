import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mockRepo } from '@/services/mockRepository'
import { Supplier } from '@/types'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const NewSupplierPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')
  const [code, setCode] = useState(`SUP-0${mockRepo.getSuppliers().length + 1}`)
  const [country, setCountry] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Confirmed Irrevocable L/C at Sight')
  const [bankDetails, setBankDetails] = useState('')

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !country) {
      toast.error('Supplier Name and Country are required.')
      return
    }

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name,
      code,
      country,
      contactPerson,
      email,
      phone,
      paymentTerms,
      totalImportedBDT: 0,
      totalPaidBDT: 0,
      balanceDueBDT: 0,
      activeShipmentsCount: 0,
      bankDetails: bankDetails || 'International Bank, SWIFT Code',
    }

    mockRepo.saveSupplier(newSup)
    dispatch(triggerDataRefresh())
    toast.success(`Supplier ${newSup.name} registered successfully!`)
    navigate(`/suppliers/${newSup.id}`)
  }

  return (
    <form onSubmit={handleSaveSupplier} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/suppliers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#202833]">Register International Supplier</h2>
            <p className="text-xs text-[#697586]">
              Add global fertilizer manufacturer or trading partner and trade finance terms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            Save Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manufacturer & Trade Finance Details</CardTitle>
          <CardDescription>Legal corporate entity and settlement arrangements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Supplier / Manufacturer Name</Label>
              <Input
                placeholder="e.g. EuroChem Group AG"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label required>Supplier Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Country of Origin</Label>
              <Input
                placeholder="e.g. Saudi Arabia, Qatar, Morocco, China"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <Input
                placeholder="e.g. Confirmed L/C at Sight 90 Days"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input
                placeholder="e.g. Export Director"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="export@supplier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone / Fax</Label>
              <Input
                placeholder="+966 11 200 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Bank Details & SWIFT Code</Label>
            <Textarea
              placeholder="Beneficiary Bank name, Branch, Account #, SWIFT code for L/C application..."
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
