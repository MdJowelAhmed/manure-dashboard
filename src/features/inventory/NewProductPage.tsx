import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Boxes, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockRepo } from '@/services/mockRepository'
import { Product } from '@/types'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store'
import { triggerDataRefresh } from '@/store/uiSlice'

export const NewProductPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [category, setCategory] = useState<'Nitrogen' | 'Phosphate' | 'Potassium' | 'Complex / NPK' | 'Micronutrient'>('Nitrogen')
  const [kgPerBag, setKgPerBag] = useState(50)
  const [initialStockMT, setInitialStockMT] = useState(0)
  const [reorderLevelMT, setReorderLevelMT] = useState(100)
  const [landedCostPerMT, setLandedCostPerMT] = useState(50000)
  const [sellingPricePerMT, setSellingPricePerMT] = useState(60000)
  const [originCountry, setOriginCountry] = useState('')
  const [description, setDescription] = useState('')

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !sku) {
      toast.error('Product Name and SKU are required.')
      return
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku,
      name,
      scientificName,
      category,
      baseUnit: 'MT',
      supportedUnits: ['MT', 'BAG', 'KG'],
      kgPerBag,
      stockMT: initialStockMT,
      reorderLevelMT,
      landedCostPerMT,
      sellingPricePerMT,
      description,
      originCountry: originCountry || 'Bangladesh / Imported',
      status: initialStockMT <= 0 ? 'Out of Stock' : initialStockMT <= reorderLevelMT ? 'Low Stock' : 'In Stock',
    }

    mockRepo.saveProduct(newProd)
    dispatch(triggerDataRefresh())
    toast.success(`Product ${newProd.name} added to catalog successfully!`)
    navigate(`/inventory/products/${newProd.id}`)
  }

  return (
    <form onSubmit={handleSaveProduct} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="iconSm"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#202833]">Add Fertilizer Product</h2>
            <p className="text-xs text-[#697586]">
              Create new catalog item with packaging unit conversions and safety stock levels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#526B83] hover:bg-[#3E5367] text-white"
          >
            Save Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commodity Specifications</CardTitle>
          <CardDescription>Product identity, chemical category, and origin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label required>Product Name</Label>
              <Input
                placeholder="e.g. Granular Urea (46% N)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label required>SKU Code</Label>
              <Input
                placeholder="e.g. FERT-UREA-GRAN"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(val: any) => setCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nitrogen">Nitrogen</SelectItem>
                  <SelectItem value="Phosphate">Phosphate</SelectItem>
                  <SelectItem value="Potassium">Potassium</SelectItem>
                  <SelectItem value="Complex / NPK">Complex / NPK</SelectItem>
                  <SelectItem value="Micronutrient">Micronutrient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Country of Origin</Label>
              <Input
                placeholder="e.g. Saudi Arabia, Morocco"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bag Packaging Size (KG)</Label>
              <Input
                type="number"
                value={kgPerBag}
                onChange={(e) => setKgPerBag(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Initial Warehouse Stock (MT)</Label>
              <Input
                type="number"
                value={initialStockMT}
                onChange={(e) => setInitialStockMT(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Safety Reorder Threshold (MT)</Label>
              <Input
                type="number"
                value={reorderLevelMT}
                onChange={(e) => setReorderLevelMT(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Estimated Landed Cost / MT (BDT)</Label>
              <Input
                type="number"
                value={landedCostPerMT}
                onChange={(e) => setLandedCostPerMT(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Standard Selling Price / MT (BDT)</Label>
              <Input
                type="number"
                value={sellingPricePerMT}
                onChange={(e) => setSellingPricePerMT(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description & Fertilizer Grade</Label>
            <Textarea
              placeholder="Chemical formula, nutrient percentages, packaging guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
