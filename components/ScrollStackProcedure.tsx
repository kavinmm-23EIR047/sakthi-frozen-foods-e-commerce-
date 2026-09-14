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
  cardBg: string;
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
      'Non-GMO soy & pea protein isolate for 1:1 amino acid balance',
      'King Oyster mushrooms & jackfruit for fibrous "mutton" grain'
    ],
    tags: ['Soy Protein', 'Pea Isolate', 'Mushrooms', 'Seitan Gluten'],
    iconName: 'Leaf',
    cardBg: 'bg-[#F9FAF6]',
    headerBg: 'bg-[#3B482E] text-white',
    accentColor: 'text-[#3B482E]',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300/60',
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
      'Firm moisture squeezing leaves maximum room for spices'
    ],
    tags: ['Hot Veg Broth', 'Firm Squeeze', 'Fiber Grain Shred'],
    iconName: 'Droplets',
    cardBg: 'bg-[#F4F9FD]',
    headerBg: 'bg-[#1E3A5F] text-white',
    accentColor: 'text-[#1E3A5F]',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300/60',
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
    cardBg: 'bg-[#FDFBF7]',
    headerBg: 'bg-[#854D0E] text-white',
    accentColor: 'text-[#854D0E]',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300/60',
    chefTip: 'Cold-pressed mustard or sesame oil locks in volatile spice aromas during frying.',
  },
  {
    step: 4,
    title: 'Natural Binding',
    phase: 'Cohesion Matrix',
    tag: 'Clean Binders',
    summary: 'Fold in roasted gram flour (besan), cornstarch, and fresh herbs to hold structural shape firmly without crumbling in gravies.',
    keyPoints: [
      'Gram flour (besan) & cornstarch ensure zero crumbling',
      'Minced shallots & curry leaves add fresh textural crunch'
    ],
    tags: ['Besan (Gram Flour)', 'Cornstarch', 'Shallots', 'Fresh Herbs'],
    iconName: 'Layers',
    cardBg: 'bg-[#FAF8FE]',
    headerBg: 'bg-[#4338CA] text-white',
    accentColor: 'text-[#4338CA]',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300/60',
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
    cardBg: 'bg-[#F4FCFA]',
    headerBg: 'bg-[#0F766E] text-white',
    accentColor: 'text-[#0F766E]',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300/60',
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
    cardBg: 'bg-[#FFF9F5]',
    headerBg: 'bg-[#C2410C] text-white',
    accentColor: 'text-[#C2410C]',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300/60',
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
    cardBg: 'bg-[#F2FBFE]',
    headerBg: 'bg-[#0369A1] text-white',
    accentColor: 'text-[#0369A1]',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300/60',
    chefTip: 'Grab exact piece portions straight from the freezer without defrosting the whole bag.',
  },
  {
    step: 8,
    title: 'Sizzle & Feast',
    phase: 'Kitchen Cook',
    tag: '100% Ready in 8 Mins',
    summary: 'Pan-fry, air-fry at 180°C, or drop directly from frozen into simmering masala gravies & biryanis in 5–8 minutes. Savor hot!',
    keyPoints: [
      'Pan-fry / deep fry in medium-hot oil until golden & crisp',
      'Simmer straight from frozen directly in bubbling gravies'
    ],
    tags: ['Pan-Fry 5-8 Mins', 'Air-Fry 180°C', 'Direct Curry Simmer'],
    iconName: 'ChefHat',
    cardBg: 'bg-[#F4FAF2]',
    headerBg: 'bg-[#15803D] text-white',
    accentColor: 'text-[#15803D]',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300/60',
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#4F534C]/15 text-[#4D583F] text-xs font-black uppercase tracking-wider shadow-xs">
            <ChefHat className="w-4 h-4 text-emerald-600 animate-float-subtle" />
            <span>8-Step Making &amp; Cooking Guide</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E201D] tracking-tight font-display">
            How Vegan Mock Meat Is Made
          </h2>

          <p className="text-xs sm:text-sm text-[#61665D] leading-relaxed max-w-lg mx-auto">
            From pure botanical protein extraction and flavor alchemy to -18°C IQF cryo-freezing and 8-minute kitchen sizzling.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-[#4D583F]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Scroll down the page to stack cards</span>
          </div>
        </div>

        {/* Centered Window Scroll Stack Container */}
        <div className="w-full max-w-3xl mx-auto">
          <ScrollStack
            itemDistance={90}
            itemScale={0.025}
            itemStackDistance={24}
            stackPosition="18%"
            scaleEndPosition="8%"
            baseScale={0.88}
            useWindowScroll={true}
          >
            {PROCEDURE_STEPS.map((s) => (
              <ScrollStackItem key={s.step} itemClassName={s.cardBg}>
                {/* Top Color Accent Header Bar (Peeks out in stack!) */}
                <div className={`px-5 sm:px-6 py-3 flex items-center justify-between shadow-xs ${s.headerBg}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs font-black text-xs sm:text-sm flex items-center justify-center border border-white/20">
                      0{s.step}
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                      {s.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/15">
                      {s.phase}
                    </span>
                    <div className="p-1 rounded-md bg-white/15 backdrop-blur-xs">
                      {getStepIcon(s.iconName, "w-4 h-4 text-white")}
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 space-y-3.5 bg-white/80 backdrop-blur-xs">
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
                      <div key={kIdx} className="flex items-start gap-1.5 text-xs text-[#2F342F] font-semibold leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chef Tip Sub-box */}
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-left">
                    <ChefHat className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] sm:text-xs text-amber-900 leading-snug">
                      <span className="font-bold">Chef&apos;s Pro Tip:</span> {s.chefTip}
                    </p>
                  </div>

                  {/* Ingredient Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200/70">
                    {s.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-md bg-white text-[#3D4732] text-[10px] sm:text-[11px] font-bold border border-gray-200 shadow-2xs"
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
