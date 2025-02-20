import { Equipment } from '../types'

// To add a new equipment type, simply add a new object to this array with:
// - id: unique identifier
// - name: display name
// - icon: icon name from lucide-react (see https://lucide.dev for available icons)
// - color: any valid CSS color (hex, rgb, or color name)
// Example: { id: 'compass', name: 'Navigation Compass', icon: 'Compass', color: '#6366f1' }
export const equipmentTypes: Equipment[] = [
  { id: 'fire-extinguisherA', name: 'Class A Extinguisher', icon: 'FireExtinguisher', color: 'red' },
  { id: 'fire-extinguisherB', name: 'Class B Extinguisher', icon: 'FireExtinguisher', color: 'blue' },
  { id: 'fire-extinguisherC', name: 'Class C Extinguisher', icon: 'FireExtinguisher', color: 'green' },
  { id: 'fire-extinguisherD', name: 'Class D Extinguisher', icon: 'FireExtinguisher', color: 'purple' },
  { id: 'hose-station', name: 'Hose Station', icon: 'Shell', color: 'orange' },
  { id: 'first-aid', name: 'First Aid Kit', icon: 'Stethoscope', color: 'green' },
  { id: 'life-buoy', name: 'Life Buoy', icon: 'LifeBuoy', color: 'orange' },
  { id: 'radio', name: 'Emergency Radio', icon: 'Radio', color: 'blue' },
  { id: 'anchor', name: 'Anchor Point', icon: 'Anchor', color: 'purple' },
  { id: 'Magazine-Flood-and-Spray', name: 'Magazine Flood and Spray', icon: 'ShowerHead', color: 'red' },
  { id: 'Halon', name: 'Halon', icon: 'FireExtinguisher', color: 'green' },
  { id: 'AFFF-system', name: 'AFFF', icon: 'FireExtinguisher', color: 'blue' },
  { id: 'AFFF/Halon', name: 'AFFF/Halon', icon: 'FireExtinguisher', color: 'purple' },
  { id: 'Quartzoid', name: 'Quartzoid', icon: 'ShowerHead', color: 'orange' },
]
