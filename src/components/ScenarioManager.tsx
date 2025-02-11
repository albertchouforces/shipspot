import { Plus, Trash2 } from 'lucide-react'
import { Scenario } from '../types'

interface ScenarioManagerProps {
  scenarios: Scenario[]
  currentScenario: Scenario | null
  onScenarioSelect: (scenario: Scenario) => void
  onCreateScenario: () => void
  onDeleteScenario: (id: string) => void
}

const ScenarioManager = ({
  scenarios,
  currentScenario,
  onScenarioSelect,
  onCreateScenario,
  onDeleteScenario,
}: ScenarioManagerProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Scenarios</h3>
        <button
          onClick={onCreateScenario}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          New Scenario
        </button>
      </div>
      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              currentScenario?.id === scenario.id
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            }`}
          >
            <button
              className="flex-1 text-left"
              onClick={() => onScenarioSelect(scenario)}
            >
              {scenario.title || 'Untitled Scenario'}
            </button>
            <button
              onClick={() => onDeleteScenario(scenario.id)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScenarioManager
