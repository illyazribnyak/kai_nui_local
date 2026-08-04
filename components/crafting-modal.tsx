'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Hammer, X, Sparkles, Check, ChevronRight, Apple, Shield, Flame } from 'lucide-react'
import type { InventoryItemData } from '@/lib/types'

interface CraftingRecipe {
  id: string
  name: string
  category: string
  description: string
  ingredients: Array<{ name: string; quantity: number }>
  resultQuantity: number
}

const RECIPES: CraftingRecipe[] = [
  {
    id: 'spear',
    name: 'Обсидіановий спис',
    category: 'зброя',
    description: 'Гостре обсидіанове вістря, міцно закріплене на дерев’яній палиці',
    ingredients: [
      { name: 'Гостра палиця', quantity: 1 },
      { name: 'Обсидіан', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'bandage',
    name: 'Цілюща пов\'язка',
    category: 'ресурс',
    description: 'Компрес з цілющого листя джунглів та гнучкої ліани для заживлення ран',
    ingredients: [
      { name: 'Цілюще листя', quantity: 1 },
      { name: 'Ліана', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'cooked_fish',
    name: 'Жарена риба',
    category: 'їжа',
    description: 'Ароматна жарена риба, що втамовує голод на 35 пунктів',
    ingredients: [
      { name: 'Сира риба', quantity: 1 },
      { name: 'Дрова', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'bow',
    name: 'Простий лук',
    category: 'зброя',
    description: 'Гнучкий деревяний лук з ліаною в якості тятиви',
    ingredients: [
      { name: 'Гнучка гілка', quantity: 1 },
      { name: 'Ліана', quantity: 1 },
    ],
    resultQuantity: 1,
  },
]

interface CraftingModalProps {
  isOpen: boolean
  inventory: InventoryItemData[]
  onClose: () => void
  onCraft: (recipeName: string) => void
  onConsumeItem: (itemName: string) => void
}

export function CraftingModal({
  isOpen,
  inventory,
  onClose,
  onCraft,
  onConsumeItem,
}: CraftingModalProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'crafting'>('crafting')

  if (!isOpen) return null

  const getInventoryCount = (name: string) => {
    const found = inventory.find((i) => i.name.toLowerCase().includes(name.toLowerCase()))
    return found ? found.quantity : 0
  }

  const canCraft = (recipe: CraftingRecipe) => {
    return recipe.ingredients.every((ing) => getInventoryCount(ing.name) >= ing.quantity)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-base">🔨 Верстак & Інвентар</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border bg-muted/10 px-4">
            <button
              type="button"
              onClick={() => setActiveTab('crafting')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'crafting'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" /> Крафтинг рецепти
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Сітка Предметів ({inventory.length})
            </button>
          </div>

          {/* Body content */}
          <div className="p-4 overflow-y-auto panel-scroll flex-1">
            {activeTab === 'crafting' ? (
              <div className="space-y-3">
                {RECIPES.map((recipe) => {
                  const craftable = canCraft(recipe)
                  return (
                    <div
                      key={recipe.id}
                      className={`p-3 rounded-xl border transition-all ${
                        craftable
                          ? 'border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/30'
                          : 'border-border/60 bg-muted/20 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{recipe.name}</span>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {recipe.category}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onCraft(`Змайструвати ${recipe.name}`)}
                          className={`px-3 py-1 text-xs rounded-lg font-semibold flex items-center gap-1 transition-all ${
                            craftable
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30 active:scale-95'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          Створити
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">{recipe.description}</p>

                      {/* Ingredients requirement list */}
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {recipe.ingredients.map((ing) => {
                          const current = getInventoryCount(ing.name)
                          const hasEnough = current >= ing.quantity
                          return (
                            <span
                              key={ing.name}
                              className={`px-2 py-0.5 rounded border font-mono ${
                                hasEnough
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                  : 'bg-red-950/40 border-red-900/60 text-red-300'
                              }`}
                            >
                              {ing.name}: {current}/{ing.quantity} {hasEnough ? '✓' : '✗'}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inventory.length === 0 ? (
                  <p className="text-xs text-muted-foreground col-span-2 text-center py-6">
                    Інвентар Лари порожній
                  </p>
                ) : (
                  inventory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs">{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-mono text-primary font-bold">
                              x{item.quantity}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          {item.category || 'ресурс'}
                        </span>
                      </div>

                      {item.category === 'їжа' || item.name.toLowerCase().includes('риба') || item.name.toLowerCase().includes('фрукт') || item.name.toLowerCase().includes('вода') ? (
                        <button
                          type="button"
                          onClick={() => onConsumeItem(`Спожити ${item.name}`)}
                          className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow active:scale-95 transition-all"
                        >
                          Спожити
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
