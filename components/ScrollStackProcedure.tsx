'use client';

import React from 'react';
import {
  ChefHat,
  Leaf,
  Droplets,
  Flame,
  Layers,
  Shapes,
  Utensils,
  Snowflake,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

interface ProcedureStep {
  step: number;
  title: string;
  phase: string;
  tag: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  iconName: string;
  headerBg: string;
  accentColor: string;
  badgeBg: string;
  chefTip: string;
}

const PROCEDURE_STEPS: ProcedureStep[] = [
  {
    step: 1,
    title: 'Choose Protein Base',
    phase: 'Botanical Matrix',
    tag: '100% Non-GMO Soy & Pea',
    summary: 'Selecting high-protein TVP soy chunks, oyster mushrooms, tender jackfruit, and wheat gluten (seitan) for an authentic fibrous meaty chew.',
    keyPoints: [
      'Non-GMO soy & pea protein isolate for 1:1 complete amino acids',
      'King Oyster mushrooms & jackfruit for fibrous succulent grain'
    ],
    tags: ['Soy Protein', 'Pea Isolate', 'Mushrooms', 'Seitan Gluten'],
    iconName: 'Leaf',
    headerBg: 'bg-[#656B4F] text-white',
    accentColor: 'text-[#656B4F]',
    badgeBg: 'bg-[#EAF0E5] text-[#50563D] border-[#656B4F]/30',
    chefTip: 'Blending soy chunks with pea isolate creates the exact springy bite of tender meat.',
  },
  {
    step: 2,
    title: 'Rehydrate & Prepare',
    phase: 'Hydration & Prep',
    tag: '15-Min Stock Soak',
    summary: 'Soak in hot aromatic vegetable stock, firmly squeeze out excess water, and shred fibers to open deep porous spice pockets.',
    keyPoints: [
      '15–20 min hot stock soak opens internal cell structure',
      'Firm moisture squeezing leaves maximum room for rich spices'
    ],
    tags: ['Hot Veg Broth', 'Firm Squeeze', 'Fiber Grain Shred'],
    iconName: 'Droplets',
    headerBg: 'bg-[#163554] text-white',
    accentColor: 'text-[#163554]',
    badgeBg: 'bg-sky-50 text-sky-900 border-sky-300',
    chefTip: 'The drier the internal pockets after squeezing, the deeper the spices soak in.',
  },
  {
    step: 3,
    title: 'Flavor Infusion',
    phase: 'Marination Matrix',
    tag: 'Authentic Spices',
    summary: 'Marinate in soy sauce, cold-pressed oils, ginger-garlic paste, roasted garam masala, and kelp for deep South Indian umami.',
    keyPoints: [
      'Cumin, coriander, black pepper & roasted garam masala',
      'Kelp & black salt (kala namak) for delicate savory depth'
    ],
    tags: ['Garam Masala', 'Ginger-Garlic', 'Cold-Pressed Oil', 'Kelp / Nori'],
    iconName: 'Flame',
    headerBg: 'bg-[#7C2D12] text-white',
    accentColor: 'text-[#7C2D12]',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
    chefTip: 'Cold-pressed mustard or sesame oil locks in volatile spice aromas during frying.',
  },
  {
    step: 4,
    title: 'Natural Clean Binding',
    phase: 'Cohesion Matrix',
    tag: 'Pure Clean Binders',
    summary: 'Fold in roasted gram flour (besan), cornstarch, and fresh herbs to hold structural shape firmly without crumbling in gravies.',
    keyPoints: [
      'Gram flour (besan) & cornstarch ensure zero crumbling',
      'Minced shallots & curry leaves add fresh textural crunch'
    ],
    tags: ['Besan (Gram Flour)', 'Cornstarch', 'Shallots', 'Fresh Herbs'],
    iconName: 'Layers',
    headerBg: 'bg-[#3730A3] text-white',
    accentColor: 'text-[#3730A3]',
    badgeBg: 'bg-purple-50 text-purple-900 border-purple-300',
    chefTip: 'Gram flour adds subtle nuttiness while preserving shape in bubbling biryanis.',
  },
  {
    step: 5,
    title: 'Artisan Shaping',
    phase: 'Molding & Sizing',
    tag: 'Uniform Cuts',
    summary: 'Precision-molded into uniform bite-sized soya balls, burger patties, fish fingers, cutlets, skewers, and rustic tender chunks.',
    keyPoints: [
      'Compact balls for biryanis & rich curries',
      'Patties, cutlets & finger strips for crispy snacking'
    ],
    tags: ['Mutton Chunks', 'Cutlets', 'Fish Fingers', 'Burger Patties'],
    iconName: 'Shapes',
    headerBg: 'bg-[#115E59] text-white',
    accentColor: 'text-[#115E59]',
    badgeBg: 'bg-teal-50 text-teal-900 border-teal-300',
    chefTip: 'Uniform sizing guarantees even cooking temperature throughout every piece.',
  },
  {
    step: 6,
    title: 'Par-Setting & Steaming',
    phase: 'Thermal Set',
    tag: 'Steam & Par-Fry',
    summary: 'Gentle steaming for sliceable dense texture and flash par-frying to seal in internal moisture, spices, and succulent tenderness.',
    keyPoints: [
      'Gentle steam sets resilient sliceable protein structure',
      'Flash par-frying seals outer pores against moisture loss'
    ],
    tags: ['Gentle Steam', 'Flash Par-Fry', 'Sealed Juices'],
    iconName: 'Utensils',
    headerBg: 'bg-[#9A3412] text-white',
    accentColor: 'text-[#9A3412]',
    badgeBg: 'bg-orange-50 text-orange-900 border-orange-300',
    chefTip: 'Par-cooking locks the outer pore layer, preventing excess oil absorption later.',
  },
  {
    step: 7,
    title: 'IQF Cryo-Freeze',
    phase: 'Cryo-Preservation',
    tag: '-18°C Flash Freeze',
    summary: 'Individually Quick Frozen (IQF) in seconds at -35°C so pieces never clump, vacuum nitrogen-sealed at -18°C for 12 months.',
    keyPoints: [
      'Instant cryogenic blast prevents ice-crystal damage',
      'Individual pieces never stick or clump in the bag'
    ],
    tags: ['IQF Flash Freeze', 'No Clumping', '-18°C Nitrogen Sealed'],
    iconName: 'Snowflake',
    headerBg: 'bg-[#0369A1] text-white',
    accentColor: 'text-[#0369A1]',
    badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-300',
    chefTip: 'Grab exact piece portions straight from the freezer without defrosting the whole bag.',
  },
  {
    step: 8,
    title: 'Sizzle & Feast',
    phase: 'Kitchen Cook',
    tag: 'Ready in 8 Mins',
    summary: 'Pan-fry, air-fry at 180°C, or drop directly from frozen into simmering masala gravies & biryanis in 5–8 minutes. Savor hot!',
    keyPoints: [
      'Pan-fry / deep fry in medium-hot oil until golden & crisp',
      'Simmer straight from frozen directly in bubbling gravies'
    ],
    tags: ['Pan-Fry 5-8 Mins', 'Air-Fry 180°C', 'Direct Curry Simmer'],
    iconName: 'ChefHat',
    headerBg: 'bg-[#50563D] text-white',
    accentColor: 'text-[#50563D]',
    badgeBg: 'bg-[#EAF0E5] text-[#50563D] border-[#656B4F]/30',
    chefTip: 'Serve immediately off the stove for maximum succulent chew and intoxicating aromatic crunch!',
  },
];

function getStepIcon(iconName: string, className = "w-4 h-4") {
  switch (iconName) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Droplets': return <Droplets className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Shapes': return <Shapes className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Snowflake': return <Snowflake className={className} />;
    case 'ChefHat': return <ChefHat className={className} />;
    default: return <Sparkles className={className} />;
  }
}

export default function ScrollStackProcedure() {
  return (
    <section className="bg-transparent border-y border-[#4F534C]/15 py-14 md:py-20 w-full relative z-10">
      <div className="site-shell">
        
        {/* Centered Top Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#4F534C]/20 text-[#2D3823] text-xs font-black uppercase tracking-wider shadow-xs">
            <ChefHat className="w-4 h-4 text-[#656B4F]" />
            <span>8-Step Making &amp; Cooking Guide</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E201D] tracking-tight font-display">
            How Vegan Mock Meat Is Made
          </h2>

          <p className="text-xs sm:text-sm text-[#555C52] leading-relaxed max-w-lg mx-auto">
            From pure botanical protein extraction and flavor alchemy to -18°C IQF cryo-freezing and 8-minute kitchen sizzling.
          </p>

          <div className="pt-1 flex items-center justify-center gap-2 text-xs font-bold text-[#3B482E]">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Scroll down the page to stack cards</span>
          </div>
        </div>

        {/* Centered Window Scroll Stack Container */}
        <div className="w-full max-w-3xl mx-auto">
          <ScrollStack
            itemStackDistance={20}
            topOffset={85}
          >
            {PROCEDURE_STEPS.map((s) => (
              <ScrollStackItem key={s.step} itemClassName="bg-white">
                {/* Top Solid Color Accent Header Bar (Peeks out in stack) */}
                <div className={`px-5 sm:px-6 py-3.5 flex items-center justify-between shadow-xs ${s.headerBg}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white/20 font-black text-xs sm:text-sm flex items-center justify-center border border-white/25">
                      0{s.step}
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                      {s.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md border border-white/25">
                      {s.phase}
                    </span>
                    <div className="p-1 rounded-md bg-white/20">
                      {getStepIcon(s.iconName, "w-4 h-4 text-white")}
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 space-y-4 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-base sm:text-xl text-[#1E201D] font-display">
                      {s.title}
                    </h3>
                    <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-md border shrink-0 ${s.badgeBg}`}>
                      {s.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4D534B] leading-relaxed">
                    {s.summary}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {s.keyPoints.map((kp, kIdx) => (
                      <div key={kIdx} className="flex items-start gap-2 text-xs text-[#2F342F] font-semibold leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#656B4F] shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chef Tip Sub-box */}
                  <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2.5 text-left">
                    <ChefHat className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                    <p className="text-[11px] sm:text-xs text-[#92400E] leading-snug">
                      <span className="font-bold">Chef&apos;s Pro Tip:</span> {s.chefTip}
                    </p>
                  </div>

                  {/* Ingredient Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200">
                    {s.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-md bg-stone-50 text-[#656B4F] text-[10px] sm:text-[11px] font-bold border border-stone-200 shadow-2xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>

      </div>
    </section>
  );
}
