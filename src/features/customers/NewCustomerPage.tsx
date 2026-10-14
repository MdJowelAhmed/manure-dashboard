import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mockRepo } from '@/services/mockRepository'
import { Customer } from '@/types'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const NewCustomerPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')
  const [code, setCode] = useState(`CUST-0${mockRepo.getCustomers().length + 1}`)
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [tradeLicenseNo, setTradeLicenseNo] = useState('')
  const [creditLimitBDT, setCreditLimitBDT] = useState(10000000)

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !district) {
      toast.error('Customer Name and District are required.')
      return
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name,
      code,
      district,
      address,
      contactPerson,
      phone,
      email,
      tradeLicenseNo: tradeLicenseNo || `TRAD/DSCC/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      creditLimitBDT,
      totalSalesBDT: 0,
      totalPaidBDT: 0,
      outstandingDueBDT: 0,
      overdueStatus: 'Normal',
    }

    mockRepo.saveCustomer(newCust)
    dispatch(triggerDataRefresh())
    toast.success(`Customer ${newCust.name} added to directory!`)
    navigate(`/customers/${newCust.id}`)
  }

  return (
    <form onSubmit={handleSaveCustomer} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/customers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Add Customer / Dealer</h2>
            <p className="text-xs text-[#334155]">
              Register domestic fertilizer distributor with trade license and credit limit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/customers')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            Save Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dealer Profile & Commercial Credentials</CardTitle>
          <CardDescription>Legal business identification and credit terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Company / Dealer Name</Label>
              <Input
                placeholder="e.g. Meghna Krishi Bitan Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label required>Customer Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>District / Region</Label>
              <Input
                placeholder="e.g. Bogura, Dinajpur, Jashore, Cumilla"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trade License #</Label>
              <Input
                placeholder="e.g. TRAD/BOG/2022/9901"
                value={tradeLicenseNo}
                onChange={(e) => setTradeLicenseNo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Business Office & Godown Address</Label>
            <Textarea
              placeholder="Full physical street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input
                placeholder="e.g. Alhaj Rafiqul Bari"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile / Phone</Label>
              <Input
                placeholder="e.g. +880 1711 223344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Credit Limit (BDT)</Label>
              <Input
                type="number"
                value={creditLimitBDT}
                onChange={(e) => setCreditLimitBDT(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
